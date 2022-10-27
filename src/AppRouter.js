import React, {lazy, Suspense, useEffect, useRef, useState} from 'react';
import {Redirect, Route, Switch, withRouter} from 'react-router-dom';
import {NAV, NAV_PATH} from './components/layout/navigation/Navigation';
import wrapperLayout from './components/layout/Layout';
import BlankContent from './pages/blank-content/BlankContent';
import Loading, {LoadingStyle} from './components/shared/Loading/Loading';
import {CredentialUtils} from './utils/credential';
import PurchaseOrderFormEditor from './pages/products/PurchaseOrder/PurchaseOrderFormEditor/PurchaseOrderFormEditor';
import PurchaseOrderManagement from './pages/products/PurchaseOrder/PurchaseOrderManagement';
import {NavigationKey, NavigationPath} from './config/NavigationPath.js';
import CallbackChaiPay from './pages/payment/CallbackChaiPay';
import {ErrorBoundary} from 'react-error-boundary';
import {AffiliateDashboard} from './pages/affiliate/AffiliateRoute';
import {PACKAGE_FEATURE_CODES} from './config/package-features';
import beehiveService from './services/BeehiveService'
import Constants from './config/Constant'
import TurnOffGoFreeModal from './components/shared/TurnOfGoFreeModal/TurnOffGoFreeModal'
import RenewingPlanModal from './components/shared/RenewingPlanModal/RenewingPlanModal'
import ExpiredPlanModal from './components/shared/ExpiredPlanModal/ExpiredPlanModal'
import storeService from './services/StoreService'
import storageService from './services/storage'
import userThemeEngineService from './services/UserThemeEngineService'
import {RouteUtils} from './utils/route'
import AlertModal, {AlertModalType} from './components/shared/AlertModal/AlertModal'
import {TokenUtils} from './utils/token'
import i18next from 'i18next'
import storage from './services/storage'
import {DateTimeUtils} from './utils/date-time'
import moment from 'moment'

const ForgotPassword = lazy(() => import('./pages/welcome/forgot-password'));
const ResetPassword = lazy(() => import('./pages/welcome/reset-password'))
const ProductList = lazy(() => import('./pages/products/ProductList/ProductList'))
const ServiceList = lazy(() => import('./pages/products/Service/ServiceList/ServiceList'))
const CustomizationTheme = lazy(() => import('./pages/storefront/customization/CustomizationTheme'))
const CustomizationDesign = lazy(() => import('./pages/storefront/customization/CustomizationDesign'))
const ProductAddNew = lazy(() => import('./pages/products/ProductAddNew/ProductAddNew'))
const ServiceAddNew = lazy(() => import('./pages/products/Service/ServiceAddNew/ServiceAddNew'))
const SupplierPage = lazy(() => import('./pages/products/Supplier/SupplierPage/SupplierPage'))
const ServiceEdit = lazy(() => import('./pages/products/Service/ServiceEdit/ServiceEdit'))
const ProductEdit = lazy(() => import('./pages/products/ProductEdit/ProductEdit'))
const VariationDetailEdit = lazy(() => import('./pages/products/VariationDetail/VariationDetail'))
const InventoryList = lazy(() => import('./pages/products/InventoryList/InventoryList'))
const ProductCollection = lazy(() => import('./pages/products/CollectionList/CollectionList'))
const ServiceCollection = lazy(() => import('./pages/products/Service/CollectionList/CollectionList'))
const ProductCollectionCreate = lazy(() => import('./pages/products/CollectionAddNew/CollectionAddNew'))
const ProductCollectionEdit = lazy(() => import('./pages/products/CollectionEdit/CollectionEdit'))
const ReviewList = lazy(() => import('./pages/products/ReviewList/ReviewList'))
const SupplierList = lazy(() => import('./pages/products/Supplier/SupplierList'))
const Step1 = lazy(() => import('./pages/welcome/wizard/Step1'))
const Step2 = lazy(() => import('./pages/welcome/wizard/Step2'))
const Step3 = lazy(() => import('./pages/welcome/wizard/Step3'))
const Step4 = lazy(() => import('./pages/welcome/wizard/Step4'))
const Step5 = lazy(() => import('./pages/welcome/wizard/Step5'))
const Step6 = lazy(() => import('./pages/welcome/wizard/Step6'))
const ShopeeAccount = lazy(() => import('./pages/shopee/account/ShopeeAccount'))
const ShopeeAccountManagement = lazy(() => import('./pages/shopee/account/ShopeeAccountManagement'))
const ShopeeProducts = lazy(() => import('./pages/shopee/products/ShopeeProducts'))
const ShopeeLinkProducts = lazy(() => import('./pages/shopee/LinkProducts/ShopeeLinkProducts'))
const ShopeeEditProduct = lazy(() => import('./pages/shopee/products/edit/ShopeeEditProduct'))
const ShopeeSyncEditProduct = lazy(() => import('./pages/shopee/products/edit/ShopeeSyncEditProduct'))
const LazadaAccount = lazy(() => import('./pages/lazada/account/LazadaAccount'))
const LazadaProducts = lazy(() => import('./pages/lazada/products/LazadaProducts'))
const DiscountDetail = lazy(() => import('./pages/discounts/Detail/DiscountDetail'))
const Setting = lazy(() => import('./pages/setting/Setting'))
const Pages = lazy(() => import('./pages/storefront/pages/Pages'))
const PageAddNew = lazy(() => import('./pages/storefront/pages/CreatePage/PageAddNew'))
const PageEdit = lazy(() => import('./pages/storefront/pages/EditPage/PageEdit'))
const Menu = lazy(() => import('./pages/storefront/menu/Menu'))
const MenuAddNew = lazy(() => import('./pages/storefront/menu/MenuAddNew/MenuAddNew'))
const MenuEdit = lazy(() => import('./pages/storefront/menu/MenuEdit/MenuEdit'))
const Domains = lazy(() => import('./pages/storefront/domains/Domains'))
const NotFound = lazy(() => import('./pages/error/NotFound'))
const OrderList = lazy(() => import('./pages/order/OrderList/OrderList'))
const ReservationList = lazy(() => import('./pages/reservation/ReservationList/ReservationList'))
const Logout = lazy(() => import('./pages/logout/Logout'))
const OrderDetail = lazy(() => import('./pages/order/orderDetail/OrderDetail'))
const OrderEdit = lazy(() => import('./pages/order/OrderEdit/OrderEdit'))
const ReservationDetail = lazy(() => import('./pages/reservation/ReservationDetail/ReservationDetail'))
const InternalServerError = lazy(() => import('./pages/error/InternalServerError'))
const SettingPlans = lazy(() => import('./pages/setting/SettingPlans/SettingPlans'))
const Callback = lazy(() => import('./pages/payment/Callback'))
const UpgradeChannelPanel = lazy(() => import('./pages/upgrade/UpgradeChannelPanel'))
const Home = lazy(() => import('./pages/home/Home'))
const StepPayment = lazy(() => import('./pages/welcome/wizard/StepPayment'))
const Step6WaitingForApprove = lazy(() => import('./pages/welcome/wizard/Step6WaitingForApprove'))
const OrderPrint = lazy(() => import('./pages/order/orderPrint/OrderPrint'))
const PrintLazadaShippingLabel = lazy(() => import('./pages/order/orderPrint/PrintLazadaShippingLabel'))
const OrderPrintReceipt = lazy(() => import('./pages/order/orderPrint/OrderPrintReceipt'))
const DiscountList = lazy(() => import('./pages/discounts/List/DiscountList'))
const LoyaltyList = lazy(() => import('./pages/marketing/Loyalty/LoyaltyList'))
const LoyaltyEdit = lazy(() => import('./pages/marketing/Loyalty/LoyaltyFormEditor/Edit/LoyaltyEdit'))
const LoyaltyAddNew = lazy(() => import('./pages/marketing/Loyalty/LoyaltyFormEditor/Create/LoyaltyAddNew'))
const DiscountCreate = lazy(() => import('./pages/discounts/DiscountEditor/Create/DiscountCreate'))
const DiscountEdit = lazy(() => import('./pages/discounts/DiscountEditor/Edit/DiscountEdit'))
const CustomerEditor = lazy(() => import('./pages/customers/Edit/CustomerEditor'))
const CustomerList = lazy(() => import('./pages/customers/List/CustomerList'))
const CustomerSegmentCreate = lazy(() => import('./pages/segment/Create/CustomerSegmentCreate'))
const CustomerSegmentEdit = lazy(() => import('./pages/segment/Edit/CustomerSegmentEdit'))
const MKNotification = lazy(() => import('./pages/marketing/Notification/Notification'))
const NotificationIntro = lazy(() => import('./pages/marketing/Notification/Intro/NotificationIntro'))
const NotificationPushCampaignCreate = lazy(() => import('./pages/marketing/Notification/PushCampaign/Create/NotificationPushCampaignCreate'))
const NotificationPushCampaignEdit = lazy(() => import('./pages/marketing/Notification/PushCampaign/Edit/NotificationPushCampaignEdit'))
const NotificationEmailCampaignCreate = lazy(() => import('./pages/marketing/Notification/EmailCampaign/Create/NotificationEmailCampaignCreate'))
const CustomerSegmentList = lazy(() => import('./pages/segment/List/SegmentList'))
const NotificationDetail = lazy(() => import('./pages/marketing/Notification/Detail/NotificationDetail'))
const StaffLogin = lazy(() => import('./pages/welcome/staff/StaffLogin'))
const AnalyticsReservations = lazy(() => import('./pages/analytic/reservations/AnalyticsReservations'))
const LiveChatIntro = lazy(() => import('./pages/live-chat/intro/LiveChatIntro'))
const LiveChatConversation = lazy(() => import('./pages/live-chat/conversation/LiveChatConversation'))
const OrderInStorePurchase = lazy(() => import('./pages/order/instorePurchase/OrderInStorePurchase'))
const InstoreQuotation = lazy(() => import('./pages/order/InstoreQuotation/InstoreQuotation'))
const BeecowAccount = lazy(() => import('./pages/beecow/account/BeecowAccount'))
const PrivateRoute = lazy(() => import('./components/shared/PrivateRouteAsync/PrivateRouteAsync'))
const LandingPage = lazy(() => import('./pages/marketing/LandingPage/LandingPage'))
const LandingPageCreate = lazy(() => import('./pages/landing-page/create/LandingPageCreate'))
const LandingPageEdit = lazy(() => import('./pages/landing-page/edit/LandingPageEdit'))
const ZaloChatIntro = lazy(() => import('./pages/live-chat/zalo/intro/ZaloChatIntro'))
const ZaloChatConversation = lazy(() => import('./pages/live-chat/zalo/conversation/ZaloChatConversation'))
const ZaloChatResolveToken = lazy(() => import('./pages/live-chat/zalo/resolve-token/ZaloChatResolveToken'))
const Signup = lazy(() => import('./pages/welcome/wizard/Redirect'))
const SettingCallCenterPlans = lazy(() => import('./pages/setting/SettingCallCenterPlans/SettingCallCenterPlans'))
const CallCenterIntro = lazy(() => import('./pages/call-center/intro/CallCenterIntro'))
const CallCenterHistoryList = lazy(() => import('./pages/call-center/history/CallCenterHistoryList'))
const MarketingEmailCampaignList = lazy(() => import('./pages/marketing/EmailCampaign/list/MarketingEmailCampaignList'))
const MarketingEmailCampaignCreate = lazy(() => import('./pages/marketing/EmailCampaign/create/MarketingEmailCampaignCreate'))
const MarketingEmailCampaignEdit = lazy(() => import('./pages/marketing/EmailCampaign/edit/MarketingEmailCampaignEdit'))
const InventoryHistory = lazy(() => import('./pages/products/InventoryList/InventoryHistory/InventoryHistory'))
const GoogleAnalytics = lazy(() => import('./pages/marketing/GoogleAnalytics/GoogleAnalytics'))
const GoogleShopping = lazy(() => import('./pages/marketing/GoogleShopping/GoogleShopping'))
const FacebookPixel = lazy(() => import('./pages/marketing/FacebookPixel/FacebookPixel'))
const LiveChatConfiguration = lazy(() => import('./pages/live-chat/configuration/LiveChatConfiguration'))
const ThemeMaking = lazy(() => import('./pages/theme/theme-making/ThemeMaking'))
const ThemeManagement = lazy(() => import('./pages/theme/manager/ThemeManagement'))
const ThemeLibrary = lazy(() => import('./pages/theme/library/ThemeLibrary'))
const ThemePreview = lazy(() => import('./pages/theme/preview/ThemePreview'))
const BlogArticleList = lazy(() => import('./pages/storefront/blog/BlogArticleList/BlogArticleList'))
const BlogArticleCreate = lazy(() => import('./pages/storefront/blog/BlogArticleCreate/BlogArticleCreate'))
const BlogArticleEdit = lazy(() => import('./pages/storefront/blog/BlogArticleEdit/BlogArticleEdit'))
const CustomPages = lazy(() => import('./pages/storefront/customPages/CustomPages'))
const CreateCustomPage = lazy(() => import('./pages/storefront/customPages/CreatePage/CreateCustomPage'))
const EditCustomPage = lazy(() => import('./pages/storefront/customPages/EditPage/EditCustomPage'))
const BuyLink = lazy(() => import('./pages/marketing/BuyLink/BuyLink'))
const BuyLinkIntro = lazy(() => import('./pages/marketing/BuyLink/Intro/BuyLinkIntro'))
const BlogCategoryManagement = lazy(() => import('./pages/storefront/blog/BlogCategoryManagement/BlogCategoryManagement'))
const BlogCategoryCreate = lazy(() => import('./pages/storefront/blog/BlogCategoryCreate/BlogCategoryCreate'))
const BlogCategoryEdit = lazy(() => import('./pages/storefront/blog/BlogCategoryEdit/BlogCategoryEdit'))
const SettingBranchPlans = lazy(() => import('./pages/setting/SettingBranchPlans/SettingBranchPlans'))
const SettingAffiliatePlans = lazy(() => import('./pages/setting/SettingAffiliatePlans/SettingAffiliatePlans'))
const CallbackEPay = lazy(() => import('./pages/payment/CallbackEPay'))
const FlashSaleCampaignManagement = lazy(() => import('./pages/flashSale/FlashSaleCampaignManagement'))
const CreateEditFlashSaleCampaign = lazy(() => import('./pages/flashSale/create/CreateEditFlashSaleCampaign'))
const FlashSaleTimeManagement = lazy(() => import('./pages/flashSale/time/FlashSaleTimeManagement'))
const FlashSaleIntro = lazy(() => import('./pages/discounts/flashsale/FlashSaleIntro'))
const ShopeeProductManagement = lazy(() => import('./pages/shopee/new-products/ShopeeProductManagement'))
const ShopeeConnector = lazy(() => import('./pages/shopee/account/ShopeeConnector'))
const PaypalConnector = lazy(() => import('./pages/setting/PaymentMethod/PaypalConnector'))
const SettingShopeePlans = lazy(() => import('./pages/shopee/ShopeePlan/SettingShopeePlans'))
const shopeeSettings = lazy(() => import('./pages/shopee/settings/ShopeeSettings'))
const SettingLanguagesPlans = lazy(() => import('./pages/setting/SettingLanguagesPlans/SettingLanguagesPlans'))
const AnalyticsOrders = lazy(() => import('./pages/analytic/orders/AnalyticsOrders'))
const ShopeeIntro = lazy(() => import('./pages/shopee/Intro/ShopeeIntro'))
const LandingPagePreview = lazy(() => import('./pages/landing-page/editor/preview/LandingPagePreview'))
const LoyaltyPointIntro = lazy(() => import('./pages/marketing/Loyalty/LoyaltyPoint/LoyaltyPointIntro'))
const LoyaltyPointSetting = lazy(() => import('./pages/marketing/Loyalty/LoyaltyPoint/LoyaltyPointSetting'))
const TransferManagement = lazy(() => import('./pages/products/TransferStock/TransferManagement'))
const TransferFormEditor = lazy(() => import('./pages/products/TransferStock/TransferFormEditor/TransferFormEditor'))
const TransferWizard = lazy(() => import('./pages/products/TransferStock/TransferWizard/TransferWizard'))
const TikiAccount = lazy(() => import('./pages/tiki/account/TikiAccount'))
const TikiProduct = lazy(() => import('./pages/tiki/product/TikiProducts'))
const TikiResolveCode = lazy(() => import('./pages/tiki/oauth/TikiResolveCode'))
const TikiEditProduct = lazy(() => import('./pages/tiki/product/edit/TikiEditProduct'))
const GoogleTagManager = lazy(() => import('./pages/marketing/GoogleTagManager/GoogleTagManager'))
const Login = lazy(() => import('./pages/welcome/login'));
const FbPageConfiguration = lazy(() => import('./pages/gosocial/configuration/FbPageConfiguration'));
const FbChatConversation = lazy(() => import('./pages/gosocial/facebook/FbMessenger'));
const FbChatAutomation = lazy(() => import('./pages/gosocial/facebook/Automation/Automation'));
const FbChatAutomationEditor = lazy(() => import('./pages/gosocial/facebook/Automation/AutomationFormEditor'));
const FbChatIntro = lazy(() => import('./pages/gosocial/intro/FbChatIntro'));
const GoSocialZaloChatIntro = lazy(() => import('./pages/gosocial/zalo/intro/GoSocialZaloChatIntro'));
const GoSocialZaloChatConversation = lazy(() => import('./pages/gosocial/zalo/ZaloChatConversation'));
const CashbookManagement = lazy(() => import('./pages/cashbook/management/CashbookManagement'));
const InventoryIMEISerialTracking = lazy(() => import('./pages/products/InventoryIMEISerialTracking/InventoryIMEISerialTracking'));
const ApiDocs = lazy(() => import('./pages/api-docs/api-docs'));
const ProductWholesalePriceCreate = lazy(() => import ('./pages/products/ProductWholesalePrice/WholesaleCreate/WholesaleCreate'));
const ProductWholesaleEdit = lazy(() => import ('./pages/products/ProductWholesalePrice/WholesaleEdit/WholesaleEdit'));
const ReturnOrderFromEditor = lazy(() => import ('./pages/order/ReturnOrderEditor/ReturnOrderFormEditor'));
const ReturnOrderList = lazy(() => import ('./pages/order/ReturnOrderList/ReturnOrderList'));
const ConversionUnitAddNew = lazy(() => import ('./pages/products/ProductConversionUnit/ConversionUnitForm/ConversionUnitAddNew'));
const ConversionUnitEdit = lazy(() => import ('./pages/products/ProductConversionUnit/ConversionUnitForm/ConversionUnitEdit'))
const ConversionUnitForm = lazy(() => import ('./pages/products/ProductConversionUnit/ConversionUnitForm/ConversionUnitForm'))
const ConversionUnitVariation = lazy(() => import ('./pages/products/ProductConversionUnit/ConversionUnitVariation/ConversionUnitVariation'))
const ConversionUnitVariationCreate = lazy(() => import ('./pages/products/ProductConversionUnit/ConversionUnitVariation/ConversionUnitVariationAddNew'))
const ConversionUnitVariationEdit = lazy(() => import ('./pages/products/ProductConversionUnit/ConversionUnitVariation/ConversionUnitVariationEdit'))
const DownloadFile = lazy(() => import('./pages/download/DownloadFile'))
const FbChatBroadcastList = lazy(() => import("./pages/gosocial/facebook/Broadcast/BroadcastList/BroadcastList"));
const FbChatBroadcastEditor = lazy(() => import("./pages/gosocial/facebook/Broadcast/BroadcastEditor/BroadcastFormEditor"));

// ignore layout wrapped loading for links below
const blankLoadingPathList = [
    NAV_PATH.login, NAV_PATH.staffLogin, NAV_PATH.forgot, NAV_PATH.reset,
    NAV_PATH.redirect, NAV_PATH.wizard, NAV_PATH.notFound, NAV_PATH.error,
    NAV_PATH.orderPrint, NAV_PATH.orderPrintReceipt, NAV_PATH.printLazadaShippingLabel, NAV_PATH.orderInStorePurchase,
    NAV_PATH.liveChat.PATH_ZALO_CHAT_RESOLVE_TOKEN
]

const LoadingPage = () => {
    return <div className="vh-100 vw-100 d-flex justify-content-center align-items-center">
        <Loading style={ LoadingStyle.DUAL_RING_GREY }/>
    </div>
}

const ErrorFallback = ({ error }) => {
    // Handle failed lazy loading of a JS/CSS chunk.
    useEffect(() => {
        const chunkFailedMessage = /Loading [\w]+ chunk [\d]+ failed/;
        if (error?.message && chunkFailedMessage.test(error.message)) {
            window.location.reload();
        }
        if (error?.message && error.message.includes('Uncaught SyntaxError:') && process.env.NODE_ENV === 'production') {
            window.location.reload();
        }
        console.error('ErrorFallback: ', error)
    }, [error]);

    return (
        <div>

        </div>
    );
}

const AppRouter = (props) => {
    const [stIsShowRenewingPlanModal, setStIsShowRenewingPlanModal] = useState(false)
    const [stIsShowExpiredPlanModal, setStIsShowExpiredPlanModal] = useState(false)

    const refAlertModal = useRef()

    useEffect(() => {
        const currentLocation = props.location.pathname

        beehiveService.getAvailableFeaturesOfUser()
            .then(features => {
                if (!features.length) {
                    beehiveService.findOrderPackagesByType(Constants.ORDER_PACKAGE_TYPE.RENEW, {
                        paid: false,
                        paymentMethod: Constants.ORDER_PAYMENT_METHOD_COD
                    })
                        .then(orders => {
                            if (orders.length) {
                                setStIsShowRenewingPlanModal(true)
                            } else {
                                setStIsShowExpiredPlanModal(currentLocation !== NAV_PATH.settingsPlans)
                            }
                        })
                }
            })
    }, [CredentialUtils.getStoreOwnerId(), props.location.pathname])

    useEffect(() => {
        Promise.all([
            storeService.getStoreCountry(),
            storeService.getStoreInfo(),
        ])
            .then(([storeCountry, storeRes]) => {
                CredentialUtils.setStoreCurrencyCode(storeCountry.currencyCode || Constants.CURRENCY.VND.CODE)
                CredentialUtils.setStoreCurrencySymbol(storeCountry.symbol || Constants.CURRENCY.VND.SYMBOL)
                CredentialUtils.setStoreCountryCode(storeCountry.countryCode || Constants.CURRENCY.VND.COUNTRY)

                CredentialUtils.setStoreName(storeRes.name)
                CredentialUtils.setStoreUrl(storeRes.url)
                CredentialUtils.setStorePhone(storeRes.contactNumber)
                CredentialUtils.setStoreAddress(storeRes.addressList)
                CredentialUtils.setStoreEmail(storeRes.email)
                CredentialUtils.setShowSupportChat(storeRes.showSupportChat)
                CredentialUtils.setUseNewGoSocial(storeRes.useNewGoSocial)
            })

        const localUseNewTheme = CredentialUtils.getThemeEngine()

        if (!localUseNewTheme) {
            userThemeEngineService.getUserThemeEngine()
                .then((useNewThemeEngine) => {
                    if (useNewThemeEngine == null && localUseNewTheme) { // record was deleted on db
                        CredentialUtils.setThemeEngine(false);
                        RouteUtils.redirectWithReload(NAV_PATH.home);
                    }

                    CredentialUtils.setThemeEngine(useNewThemeEngine === undefined ? '' : useNewThemeEngine);
                })
        }
    }, [CredentialUtils.getStoreId()])

    useEffect(() => {
        if (TokenUtils.isStaff()) {
            storeService.getListActiveBranchOfStaff()
                .then(result => {
                    const data = result || [];
                    if (!data.length) {
                        refAlertModal.openModal({
                            type: AlertModalType.ALERT_TYPE_OK,
                            modalTitle: i18next.t('common.txt.confirm.modal.title'),
                            messages: i18next.t('common.validation.staff.none.permission'),
                            modalBtn: i18next.t('common.txt.alert.modal.logout'),
                            closeCallback: doLogout
                        });
                    }
                })
        }
    }, [TokenUtils.isStaff()])

    useEffect(() => {
        const storeId = storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_ID);

        if (storeId !== null) {
            let lastAccessDate = storageService.getFromLocalStorage(Constants.LAST_ACCESS_DATE);
            let now = DateTimeUtils.formatDDMMYYY(moment.now());
            if (lastAccessDate !== now) {
                beehiveService.updateLastAccessOfStore()
                    .then(() => {
                        storageService.setToLocalStorage(Constants.LAST_ACCESS_DATE, now);
                    });
            }
        }
    }, [storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_ID), storageService.getFromLocalStorage(Constants.LAST_ACCESS_DATE)])

    const doLogout = () => {
        storage.removeSessionStorage(Constants.STORAGE_KEY_FORCE_LOGOUT);
        RouteUtils.redirectWithoutReload(NavigationPath.logout)
    }

    /**
     * Help lazy load transition was smoother
     * @return {JSX.Element}
     */
    const renderSuspenseFallback = () => {
        const pathName = props.location.pathname
        for (const blankLoadingPath of blankLoadingPathList) {
            if (blankLoadingPath.includes(pathName)) {
                return <LoadingPage/>
            }
        }

        if (CredentialUtils.getAccessToken()) {
            const BlankLoggedIn = wrapperLayout(BlankContent, localStorage.getItem('nav'))
            return <BlankLoggedIn/>
        }
        return <LoadingPage/>
    }

    return (
        <>
            <TurnOffGoFreeModal/>
            <RenewingPlanModal toggle={ stIsShowRenewingPlanModal }/>
            <ExpiredPlanModal toggle={ stIsShowExpiredPlanModal }/>
            <AlertModal ref={ (el) => {
                refAlertModal.current = el
            } }/>

            <ErrorBoundary FallbackComponent={ ErrorFallback }>
                <Suspense fallback={ renderSuspenseFallback() }>
                    <Switch>
                        <Route exact path="/" render={ () => (<Redirect to={ NAV_PATH.home }/>) }/>
                        <Route path={ NavigationPath.login } component={ Login }/>
                        <Route path={ NavigationPath.apiDocs } component={ ApiDocs }/>

                        <Route path={ NAV_PATH.staffLogin } component={ StaffLogin }/>
                        <Route path={ NAV_PATH.forgot } component={ ForgotPassword }/>
                        <Route path={ NavigationPath.staffForgot }
                               component={ () => <ForgotPassword isStaff={ true }/> }/>
                        <Route path={ NAV_PATH.reset } component={ ResetPassword }/>
                        <Route path={ NAV_PATH.redirect + '/:action' } component={ Signup }/>
                        <Route path={ NAV_PATH.wizard + '/1/pkg/:pkgId/exp/:expId' } component={ Step1 }/>
                        <Route path={ NAV_PATH.wizard + '/1' } component={ Step1 }/>
                        <Route path={ NAV_PATH.wizard + '/2' } component={ Step2 }/>
                        <Route path={ NAV_PATH.wizard + '/3' } component={ Step3 }/>
                        <Route path={ NAV_PATH.wizard + '/4' } component={ Step4 }/>
                        <Route path={ NAV_PATH.wizard + '/5' } component={ Step5 }/>
                        <Route path={ NAV_PATH.wizard + '/payment' } component={ StepPayment }/>
                        <Route path={ NAV_PATH.wizard + '/6' } component={ Step6 }/>
                        <Route path={ NAV_PATH.wizard + '/waiting-for-approve' } component={ Step6WaitingForApprove }/>
                        <Route path={ NavigationPath.downloadFile } component={ DownloadFile }/>
                        <Route path={ NAV_PATH.notFound } component={ NotFound }/>
                        <PrivateRoute path={ NAV_PATH.error }
                                      component={ InternalServerError }
                                      checkPackageFeature={ false }
                                      checkStaff={ false }
                                      checkExpired={ false }
                        />
                        <PrivateRoute key={ NAV_PATH.home }
                                      nav={ NAV.home }
                                      exact
                                      path={ NAV_PATH.home }
                                      component={ Home }
                        />
                        <PrivateRoute key={ NAV_PATH.reservations }
                                      nav={ NAV.reservations }
                                      exact
                                      path={ NAV_PATH.reservations }
                                      component={ ReservationList }
                        />
                        <PrivateRoute key={ NAV_PATH.reservationDetail }
                                      nav={ NAV.reservations }
                                      exact
                                      path={ NAV_PATH.reservationDetail + '/:reservationId' }
                                      component={ ReservationDetail }
                        />


                        {/*ORDER*/ }
                        <PrivateRoute key={ NAV_PATH.orders }
                                      nav={ NAV.orders.order }
                                      exact
                                      path={ NAV_PATH.orders }
                                      component={ OrderList }
                        />
                        <PrivateRoute key={ NAV_PATH.orderDetail + 'siteCode' }
                                      nav={ NAV.orders }
                                      exact
                                      path={ NAV_PATH.orderDetail + '/:siteCode/:orderId' }
                                      component={ OrderDetail }
                        />

                        <PrivateRoute key={ NAV_PATH.orderEdit }
                                      nav={ NAV.orders }
                                      exact
                                      path={ NAV_PATH.orderEdit + '/:bcOrderId' }
                                      component={ OrderEdit }
                        />


                        <PrivateRoute key={ NAV_PATH.returnOderList }
                                      nav={ NAV.orders.returnOrder }
                                      exact
                                      path={ NAV_PATH.returnOderList }
                                      hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.WEB_PACKAGE, PACKAGE_FEATURE_CODES.APP_PACKAGE, PACKAGE_FEATURE_CODES.POS_PACKAGE, PACKAGE_FEATURE_CODES.SOCIAL_PACKAGE]}
                                      component={ ReturnOrderList }
                        />

                        <PrivateRoute key={ NAV_PATH.returnOderList }
                                      nav={ NAV.orders.returnOrder }
                                      exact
                                      path={ NAV_PATH.returnOrderWizard + '/:id' }
                                      hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.WEB_PACKAGE, PACKAGE_FEATURE_CODES.APP_PACKAGE, PACKAGE_FEATURE_CODES.POS_PACKAGE, PACKAGE_FEATURE_CODES.SOCIAL_PACKAGE]}
                                      component={ ReturnOrderFromEditor }
                        />

                        <PrivateRoute key={ NAV_PATH.returnOderList }
                                      nav={ NAV.orders.returnOrder }
                                      exact
                                      path={ NAV_PATH.returnOderCreate + '/order/:orderId' }
                                      hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.WEB_PACKAGE, PACKAGE_FEATURE_CODES.APP_PACKAGE, PACKAGE_FEATURE_CODES.POS_PACKAGE, PACKAGE_FEATURE_CODES.SOCIAL_PACKAGE]}
                                      component={ ReturnOrderFromEditor }
                        />

                        <PrivateRoute key={ NAV_PATH.returnOderList }
                                      nav={ NAV.orders.returnOrder }
                                      exact
                                      path={ NAV_PATH.returnOderEdit + '/:id' }
                                      hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.WEB_PACKAGE, PACKAGE_FEATURE_CODES.APP_PACKAGE, PACKAGE_FEATURE_CODES.POS_PACKAGE, PACKAGE_FEATURE_CODES.SOCIAL_PACKAGE]}
                                      component={ ReturnOrderFromEditor }
                        />

                        <PrivateRoute key={ NAV_PATH.orderPrint + 'siteCode' }
                                      nav={ NAV.orders }
                                      exact
                                      path={ NAV_PATH.orderPrint + '/:siteCode/:orderId' }
                                      wrapLayout={ false }
                                      component={ OrderPrint }
                        />
                        <PrivateRoute key={ NAV_PATH.orderPrintReceipt + 'siteCode' }
                                      nav={ NAV.orders }
                                      exact
                                      path={ NAV_PATH.orderPrintReceipt + '/:siteCode/:orderId' }
                                      wrapLayout={ false }
                                      component={ OrderPrintReceipt }
                        />
                        <PrivateRoute key={ NAV_PATH.printLazadaShippingLabel }
                                      nav={ NAV.orders }
                                      exact
                                      path={ NAV_PATH.printLazadaShippingLabel }
                                      wrapLayout={ false }
                                      component={ PrintLazadaShippingLabel }
                        />
                        <PrivateRoute key={ NAV_PATH.orderInStorePurchase }
                                      nav={ NAV.orders.inStorePurchase }
                                      exact
                                      path={ NAV_PATH.orderInStorePurchase }
                                      wrapLayout={ false }
                                      hasAnyPackageFeature={ [PACKAGE_FEATURE_CODES.POS_PACKAGE] }
                                      component={ OrderInStorePurchase }

                        />
                        <PrivateRoute key={ NAV_PATH.quotation }
                                      nav={ NAV.orders.quotation }
                                      exact
                                      path={ NAV_PATH.quotation }
                                      hasAnyPackageFeature={ [PACKAGE_FEATURE_CODES.WEB_PACKAGE, PACKAGE_FEATURE_CODES.APP_PACKAGE, PACKAGE_FEATURE_CODES.POS_PACKAGE, PACKAGE_FEATURE_CODES.SOCIAL_PACKAGE] }
                                      component={ InstoreQuotation }
                        />

                        <PrivateRoute key={ NAV_PATH.themeEngine.management }
                                      nav={ NAV.customization }
                                      exact
                                      path={ NAV_PATH.themeEngine.management }
                                      component={ ThemeManagement }
                        />

                        {/*STOREFRONT*/ }
                        <PrivateRoute key={ NAV_PATH.storefront }
                                      nav={ NAV.customization }
                                      exact
                                      path={ NAV_PATH.storefront }
                                      component={ CustomizationTheme }
                                      redirectTo={ NAV_PATH.themeEngine.management }
                        />

                        {/*CUSTOMIZE*/ }
                        <PrivateRoute key={ NAV_PATH.customization }
                                      nav={ NAV.customization }
                                      exact
                                      path={ NAV_PATH.customization }
                                      component={ CustomizationTheme }
                                      redirectTo={ NAV_PATH.themeEngine.management }
                        />

                        <PrivateRoute key={ NAV_PATH.customizationDesign }
                                      nav={ NAV.customization }
                                      exact
                                      path={ NAV_PATH.customizationDesign }
                                      component={ CustomizationDesign }
                                      redirectTo={ NAV_PATH.themeEngine.management }
                        />


                        {/*BLOG*/ }
                        <PrivateRoute key={ NAV_PATH.blog }
                                      nav={ NAV.storefront.blog }
                                      exact
                                      path={ NAV_PATH.blog }
                                      component={ BlogArticleList }
                        />

                        <PrivateRoute key={ NAV_PATH.articleCreate }
                                      nav={ NAV.storefront.blog }
                                      exact
                                      path={ NAV_PATH.articleCreate }
                                      component={ BlogArticleCreate }
                        />

                        <PrivateRoute key={ NAV_PATH.articleEdit }
                                      nav={ NAV.storefront.blog }
                                      exact
                                      path={ NAV_PATH.articleEdit + '/:articleId' }
                                      component={ BlogArticleEdit }
                        />

                        <PrivateRoute key={ NAV_PATH.blogCategoryManagement }
                                      nav={ NAV.storefront.blog }
                                      exact
                                      path={ NAV_PATH.blogCategoryManagement }
                                      component={ BlogCategoryManagement }
                        />

                        <PrivateRoute key={ NAV_PATH.blogCategoryCreate }
                                      nav={ NAV.storefront.blog }
                                      exact
                                      path={ NAV_PATH.blogCategoryCreate }
                                      component={ BlogCategoryCreate }
                        />

                        <PrivateRoute key={ NAV_PATH.blogCategoryEdit }
                                      nav={ NAV.storefront.blog }
                                      exact
                                      path={ NAV_PATH.blogCategoryEdit + '/:categoryId' }
                                      component={ BlogCategoryEdit }
                        />

                        {/*PAGES*/ }
                        <PrivateRoute key={ NAV_PATH.pages }
                                      nav={ NAV.pages }
                                      exact
                                      path={ NAV_PATH.pages }
                                      component={ Pages }
                                      redirectTo={ NAV_PATH.customPages }
                        />
                        <PrivateRoute key={ NAV_PATH.pagesCreate }
                                      nav={ NAV.pages }
                                      exact
                                      path={ NAV_PATH.pagesCreate }
                                      component={ PageAddNew }
                                      redirectTo={ NAV_PATH.createCustomPage }
                        />
                        <PrivateRoute key={ NAV_PATH.pagesEdit + '/:itemId' }
                                      nav={ NAV.pages }
                                      exact
                                      path={ NAV_PATH.pagesEdit + '/:itemId' }
                                      component={ PageEdit }
                                      redirectTo={ NAV_PATH.editCustomPage + '/:itemId' }
                        />

                        {/*CUSTOM PAGES*/ }
                        <PrivateRoute key={ NAV_PATH.customPages }
                                      nav={ NAV.storefront.customPages }
                                      exact
                                      path={ NAV_PATH.customPages }
                                      component={ CustomPages }
                        />
                        <PrivateRoute key={ NAV_PATH.createCustomPage }
                                      nav={ NAV.storefront.customPages }
                                      exact
                                      path={ NAV_PATH.createCustomPage }
                                      component={ CreateCustomPage }
                        />
                        <PrivateRoute key={ NAV_PATH.editCustomPage + '/:itemId' }
                                      nav={ NAV.storefront.customPages }
                                      exact
                                      path={ NAV_PATH.editCustomPage + '/:itemId' }
                                      component={ EditCustomPage }
                        />
                        {/*MENU*/ }

                        <PrivateRoute key={ NAV_PATH.menu }
                                      nav={ NAV.menu }
                                      exact
                                      path={ NAV_PATH.menu }
                                      component={ Menu }
                        />


                        <PrivateRoute key={ NAV_PATH.menuAdd }
                                      nav={ NAV.menu }
                                      exact
                                      path={ NAV_PATH.menuAdd }
                                      component={ MenuAddNew }
                        />


                        <PrivateRoute key={ NAV_PATH.menuEdit }
                                      exact
                                      nav={ NAV.menu }
                                      path={ NAV_PATH.menuEdit }
                                      component={ MenuEdit }
                        />

                        {/*DOMAIN*/ }

                        <PrivateRoute key={ NAV_PATH.domains }
                                      nav={ NAV.domains }
                                      exact
                                      path={ NAV_PATH.domains }
                                      component={ Domains }
                        />

                        {/*LIVE CHAT*/ }

                        <PrivateRoute key={ NAV_PATH.liveChat.ROOT }
                                      nav={ NAV.liveChat.facebook }
                                      exact
                                      path={ NAV_PATH.liveChat.PATH_LIVE_CHAT_INTRO }
                                      component={ LiveChatIntro }
                        />

                        {/*FACEBOOK*/ }
                        <PrivateRoute key={ NAV_PATH.liveChat.PATH_LIVE_CHAT_INTRO }
                                      nav={ NAV.liveChat.facebook }
                                      exact
                                      path={ NAV_PATH.liveChat.PATH_LIVE_CHAT_INTRO }
                                      component={ LiveChatIntro }
                        />

                        <PrivateRoute key={ NAV_PATH.liveChat.PATH_LIVE_CHAT_CONVERSATION }
                                      nav={ NAV.liveChat.facebook }
                                      exact
                                      path={ NAV_PATH.liveChat.PATH_LIVE_CHAT_CONVERSATION }
                                      component={ LiveChatConversation }
                        />

                        {/*ZALO*/ }
                        <PrivateRoute key={ NAV_PATH.liveChat.PATH_ZALO_CHAT_INTRO }
                                      nav={ NAV.liveChat.zalo }
                                      exact
                                      path={ NAV_PATH.liveChat.PATH_ZALO_CHAT_INTRO }
                                      component={ ZaloChatIntro }
                        />


                        <PrivateRoute key={ NAV_PATH.liveChat.PATH_ZALO_CHAT_CONVERSATION }
                                      nav={ NAV.liveChat.zalo }
                                      exact
                                      path={ NAV_PATH.liveChat.PATH_ZALO_CHAT_CONVERSATION }
                                      component={ ZaloChatConversation }
                        />

                        <PrivateRoute key={ NAV_PATH.liveChat.PATH_ZALO_CHAT_RESOLVE_TOKEN }
                                      nav={ NAV.liveChat.zalo }
                                      exact
                                      path={ NAV_PATH.liveChat.PATH_ZALO_CHAT_RESOLVE_TOKEN }
                                      component={ ZaloChatResolveToken }
                                      wrapLayout={ false }
                        />

                        <PrivateRoute key={ NAV_PATH.saleChannel.storefront.preferences }
                                      nav={ NAV.storefront.preferences }
                                      exact
                                      path={ NAV_PATH.saleChannel.storefront.preferences }
                                      hasAnyPackageFeature={ [PACKAGE_FEATURE_CODES.WEB_PACKAGE, PACKAGE_FEATURE_CODES.APP_PACKAGE] }
                                      component={ LiveChatConfiguration }
                        />

                        {/*GOSOCIAL*/ }
                        <PrivateRoute key={ NAV_PATH.goSocial.ROOT }
                                      nav={ NAV.goSocial }
                                      exact
                                      path={ NAV_PATH.goSocial.ROOT }
                                      component={ FbChatIntro }
                        />
                        <PrivateRoute key={ NAV_PATH.goSocial.PATH_GOSOCIAL_INTRO }
                                      nav={ NAV.goSocial.facebook }
                                      exact
                                      path={ NAV_PATH.goSocial.PATH_GOSOCIAL_INTRO }
                                      component={ FbChatIntro }
                        />
                        <PrivateRoute key={ NAV_PATH.goSocial.PATH_GOSOCIAL_CONVERSATION }
                                      nav={ NAV.goSocial.facebook.conversation }
                                      exact
                                      path={ NAV_PATH.goSocial.PATH_GOSOCIAL_CONVERSATION }
                                      component={ FbChatConversation }
                        />
                        <PrivateRoute key={ NAV_PATH.goSocial.PATH_GOSOCIAL_AUTOMATION }
                                      nav={ NAV.goSocial.facebook.automation }
                                      exact
                                      path={ NAV_PATH.goSocial.PATH_GOSOCIAL_AUTOMATION }
                                      component={ FbChatAutomation }
                        />

                        <PrivateRoute key={ NAV_PATH.goSocial.PATH_GOSOCIAL_AUTOMATION_CREATE }
                                      nav={ NAV.goSocial.facebook.automation }
                                      exact
                                      path={ NAV_PATH.goSocial.PATH_GOSOCIAL_AUTOMATION_CREATE }
                                      component={ FbChatAutomationEditor }
                        />

                        <PrivateRoute key={ NAV_PATH.goSocial.PATH_GOSOCIAL_AUTOMATION_EDIT }
                                      nav={ NAV.goSocial.facebook.automation }
                                      exact
                                      path={ NAV_PATH.goSocial.PATH_GOSOCIAL_AUTOMATION_EDIT + '/:id' }
                                      component={ FbChatAutomationEditor }
                        />

                        <PrivateRoute key={ NAV_PATH.goSocial.PATH_GOSOCIAL_CONFIGURATION }
                                      nav={ NAV.goSocial.facebook.configuration }
                                      exact
                                      path={ NAV_PATH.goSocial.PATH_GOSOCIAL_CONFIGURATION }
                                      component={ FbPageConfiguration }
                        />

                        <PrivateRoute key={NAV_PATH.goSocial.PATH_GOSOCIAL_BROADCAST}
                                      nav={NAV.goSocial.facebook.broadcast}
                                      exact
                                      path={NAV_PATH.goSocial.PATH_GOSOCIAL_BROADCAST}
                                      component={FbChatBroadcastList}
                        />

                        <PrivateRoute key={ NAV_PATH.goSocial.PATH_GOSOCIAL_BROADCAST_CREATE }
                                      nav={ NAV.goSocial.facebook.broadcast }
                                      exact
                                      path={ NAV_PATH.goSocial.PATH_GOSOCIAL_BROADCAST_CREATE }
                                      component={ FbChatBroadcastEditor }
                        />

                        <PrivateRoute key={ NAV_PATH.goSocial.PATH_GOSOCIAL_BROADCAST_EDIT }
                                      nav={ NAV.goSocial.facebook.broadcast }
                                      exact
                                      path={ NAV_PATH.goSocial.PATH_GOSOCIAL_BROADCAST_EDIT + '/:id' }
                                      component={ FbChatBroadcastEditor }
                        />
                        {/*GOSOCIAL ZALO*/ }
                        <PrivateRoute key={ NAV_PATH.goSocial.PATH_GOSOCIAL_ZALO_CHAT_INTRO }
                                      nav={ NAV.goSocial.zalo }
                                      exact
                                      path={ NAV_PATH.goSocial.PATH_GOSOCIAL_ZALO_CHAT_INTRO }
                                      component={ GoSocialZaloChatIntro }
                        />
                        <PrivateRoute key={ NAV_PATH.goSocial.PATH_GOSOCIAL_ZALO_CHAT_CONVERSATION }
                                      nav={ NAV.goSocial.zalo }
                                      exact
                                      path={ NAV_PATH.goSocial.PATH_GOSOCIAL_ZALO_CHAT_CONVERSATION }
                                      component={ GoSocialZaloChatConversation }
                        />

                        <Route key={ NAV_PATH.theme.PATH_THEME_MAKING }
                               nav={ NAV.theme.making }
                               exact
                               path={ NAV_PATH.theme.PATH_THEME_MAKING }
                               component={ ThemeMaking }
                        />

                        {/*PRODUCT*/ }

                        <PrivateRoute key={ NAV_PATH.products }
                                      nav={ NAV.productProduct }
                                      exact
                                      path={ NAV_PATH.products }
                                      component={ ProductList }
                        />
                        <PrivateRoute key={ NAV_PATH.productCreate }
                                      nav={ NAV.productProduct }
                                      exact
                                      path={ NAV_PATH.productCreate }
                                      component={ ProductAddNew }
                        />

                        <PrivateRoute key={ NAV_PATH.productWholeSaleCreate }
                                      nav={ NAV.productProduct }
                                      exact
                                      path={ NAV_PATH.productWholeSaleCreate + '/:itemId' }
                                      component={ ProductWholesalePriceCreate }
                        />

                        <PrivateRoute key={ NAV_PATH.productWholeSaleEdit }
                                      nav={ NAV.productProduct }
                                      exact
                                      path={ NAV_PATH.productWholeSaleEdit + '/:itemId' }
                                      component={ ProductWholesaleEdit }
                        />

                        <PrivateRoute key={ NAV_PATH.productConversionUnitCreate }
                                      nav={ NAV.productProduct }
                                      exact
                                      path={ NAV_PATH.productConversionUnitCreate + '/:itemId' }
                                      component={ ConversionUnitAddNew }
                        />

                        <PrivateRoute key={ NAV_PATH.productConversionUnitEdit }
                                      nav={ NAV.productProduct }
                                      exact
                                      path={ NAV_PATH.productConversionUnitEdit + '/:itemId' }
                                      component={ ConversionUnitEdit }
                        />

                        <PrivateRoute key={ NAV_PATH.productConversionUnitVariation }
                                      nav={ NAV.productProduct }
                                      exact
                                      path={ NAV_PATH.productConversionUnitVariation + '/:itemId' }
                                      component={ ConversionUnitVariation }
                        />

                        <PrivateRoute key={ NAV_PATH.productConversionUnitVariationCreate }
                                      nav={ NAV.productProduct }
                                      exact
                                      path={ NAV_PATH.productConversionUnitVariationCreate + '/:itemId' }
                                      component={ ConversionUnitVariationCreate }
                        />

                        <PrivateRoute key={ NAV_PATH.productConversionUnitVariationEdit }
                                      nav={ NAV.productProduct }
                                      exact
                                      path={ NAV_PATH.productConversionUnitVariationEdit + '/:itemId' }
                                      component={ ConversionUnitVariationEdit }
                        />

                        <PrivateRoute key={ NAV_PATH.productEdit }
                                      nav={ NAV.productProduct }
                                      exact
                                      path={ NAV_PATH.productEdit + '/:itemId' }
                                      component={ ProductEdit }
                        />
                        <PrivateRoute key={ NAV_PATH.supplierCreate }
                                      nav={ NAV.supplier }
                                      exact
                                      path={ NAV_PATH.supplierCreate }
                                      hasAnyPackageFeature={ [PACKAGE_FEATURE_CODES.POS_PACKAGE, PACKAGE_FEATURE_CODES.SOCIAL_PACKAGE] }
                                      component={ SupplierPage }
                        />
                        <PrivateRoute key={ NAV_PATH.supplierEdit }
                                      nav={ NAV.supplier }
                                      exact
                                      path={ NAV_PATH.supplierEdit + '/:itemId' }
                                      hasAnyPackageFeature={ [PACKAGE_FEATURE_CODES.POS_PACKAGE, PACKAGE_FEATURE_CODES.SOCIAL_PACKAGE] }
                                      component={ SupplierPage }
                        />
                        <PrivateRoute key={ NAV_PATH.variationDetailEdit }
                                      nav={ NAV.productProduct }
                                      exact
                                      path={ NAV_PATH.variationDetailEdit }
                                      component={ VariationDetailEdit }
                        />

                        <PrivateRoute key={ NAV_PATH.inventoryHistory }
                                      nav={ NAV.inventory }
                                      exact
                                      path={ NAV_PATH.inventoryHistory }
                                      component={ InventoryHistory }
                        />

                        <PrivateRoute key={ NAV_PATH.inventoryHistory }
                                      nav={ NAV.inventory }
                                      exact
                                      path={ NAV_PATH.inventoryHistory }
                                      component={ InventoryHistory }
                        />

                        <PrivateRoute key={ NavigationPath.inventoryTracking }
                                      nav={ NavigationKey.inventory }
                                      exact
                                      path={ NavigationPath.inventoryTracking + '/:id' }
                                      component={ InventoryIMEISerialTracking }
                        />

                        <PrivateRoute key={ NAV_PATH.transferStock }
                                      nav={ NAV.transferStock }
                                      exact
                                      path={ NAV_PATH.transferStock }
                                      component={ TransferManagement }
                                      hasAnyPackageFeature={ [PACKAGE_FEATURE_CODES.POS_PACKAGE, PACKAGE_FEATURE_CODES.SOCIAL_PACKAGE] }
                        />

                        <PrivateRoute key={ NAV_PATH.transferStock }
                                      nav={ NAV.transferStock }
                                      exact
                                      path={ NAV_PATH.transferStockCreate }
                                      component={ TransferFormEditor }
                                      hasAnyPackageFeature={ [PACKAGE_FEATURE_CODES.POS_PACKAGE, PACKAGE_FEATURE_CODES.SOCIAL_PACKAGE] }
                        />

                        <PrivateRoute key={ NAV_PATH.transferStock }
                                      nav={ NAV.transferStock }
                                      exact
                                      path={ NAV_PATH.transferStockEdit + '/:transferId' }
                                      component={ TransferFormEditor }
                                      hasAnyPackageFeature={ [PACKAGE_FEATURE_CODES.POS_PACKAGE, PACKAGE_FEATURE_CODES.SOCIAL_PACKAGE] }
                        />

                        <PrivateRoute key={ NAV_PATH.transferStock }
                                      nav={ NAV.transferStock }
                                      exact
                                      path={ NAV_PATH.transferStockWizard + '/:transferId' }
                                      component={ TransferWizard }
                                      hasAnyPackageFeature={ [PACKAGE_FEATURE_CODES.POS_PACKAGE, PACKAGE_FEATURE_CODES.SOCIAL_PACKAGE] }
                        />

                        <PrivateRoute key={ NAV_PATH.purchaseOrder }
                                      nav={ NAV.purchaseOrder }
                                      exact
                                      path={ NAV_PATH.purchaseOrder }
                                      hasAnyPackageFeature={ [PACKAGE_FEATURE_CODES.POS_PACKAGE, PACKAGE_FEATURE_CODES.SOCIAL_PACKAGE] }
                                      component={ PurchaseOrderManagement }
                        />

                        <PrivateRoute key={ NAV_PATH.purchaseOrder }
                                      nav={ NAV.purchaseOrder }
                                      exact
                                      path={ NAV_PATH.purchaseOrderCreate }
                                      hasAnyPackageFeature={ [PACKAGE_FEATURE_CODES.POS_PACKAGE, PACKAGE_FEATURE_CODES.SOCIAL_PACKAGE] }
                                      component={ PurchaseOrderFormEditor }
                        />

                        <PrivateRoute key={ NAV_PATH.purchaseOrder }
                                      nav={ NAV.purchaseOrder }
                                      exact
                                      path={ NAV_PATH.purchaseOrderEdit + '/:purchaseOrderId' }
                                      hasAnyPackageFeature={ [PACKAGE_FEATURE_CODES.POS_PACKAGE, PACKAGE_FEATURE_CODES.SOCIAL_PACKAGE] }
                                      component={ PurchaseOrderFormEditor }
                        />

                        <PrivateRoute key={ NAV_PATH.purchaseOrder }
                                      nav={ NAV.purchaseOrder }
                                      exact
                                      path={ NAV_PATH.purchaseOrderWizard + '/:purchaseOrderId' }
                                      hasAnyPackageFeature={ [PACKAGE_FEATURE_CODES.POS_PACKAGE, PACKAGE_FEATURE_CODES.SOCIAL_PACKAGE] }
                                      component={ PurchaseOrderFormEditor }
                        />


                        {/*SERVICE*/ }

                        <PrivateRoute key={ NAV_PATH.services }
                                      nav={ NAV.productService }
                                      exact
                                      path={ NAV_PATH.services }
                                      component={ ServiceList }
                        />

                        <PrivateRoute key={ NAV_PATH.serviceCreate }
                                      nav={ NAV.productService }
                                      exact
                                      path={ NAV_PATH.serviceCreate }
                                      component={ ServiceAddNew }
                        />

                        <PrivateRoute key={ NAV_PATH.serviceEdit }
                                      nav={ NAV.productService }
                                      exact
                                      path={ NAV_PATH.serviceEdit + '/:itemId' }
                                      component={ ServiceEdit }
                        />

                        <PrivateRoute key={ NAV_PATH.collections }
                                      nav={ NAV.productCollection }
                                      exact
                                      path={ NAV_PATH.collections }
                                      component={ ProductCollection }
                        />

                        <PrivateRoute key={ NAV_PATH.collectionCreate }
                                      nav={ NAV.productCollection }
                                      exact
                                      path={ NAV_PATH.collectionCreate + '/:itemType' } // itemType: product | service
                                      component={ ProductCollectionCreate }
                        />
                        <PrivateRoute key={ NAV_PATH.collectionEdit }
                                      nav={ NAV.productCollection }
                                      exact
                                      path={ NAV_PATH.collectionEdit + '/:itemType/:itemId' } // itemType: product | service
                                      component={ ProductCollectionEdit }
                        />

                        <PrivateRoute key={ NAV_PATH.collectionsService }
                                      nav={ NAV.serviceCollection }
                                      exact
                                      path={ NAV_PATH.collectionsService }
                                      component={ ServiceCollection }
                        />

                        <PrivateRoute key={ NAV_PATH.collectionServiceCreate }
                                      nav={ NAV.serviceCollection }
                                      exact
                                      path={ NAV_PATH.collectionServiceCreate + '/:itemType' } // itemType: product | service
                                      component={ ProductCollectionCreate }
                        />
                        <PrivateRoute key={ NAV_PATH.collectionServiceEdit }
                                      nav={ NAV.serviceCollection }
                                      exact
                                      path={ NAV_PATH.collectionServiceEdit + '/:itemType/:itemId' } // itemType: product | service
                                      component={ ProductCollectionEdit }
                        />

                        <PrivateRoute key={ NAV_PATH.analytics.ROOT }
                                      nav={ NAV.analytics.orders }
                                      exact
                                      path={ NAV_PATH.analytics.ROOT }
                                      component={ AnalyticsOrders }
                        />

                        <PrivateRoute key={ NAV_PATH.analytics.ORDERS }
                                      nav={ NAV.analytics.orders }
                                      exact
                                      path={ NAV_PATH.analytics.ORDERS }
                                      component={ AnalyticsOrders }
                        />

                        <PrivateRoute key={ NAV_PATH.analytics.RESERVATIONS }
                                      nav={ NAV.analytics.reservations }
                                      exact
                                      path={ NAV_PATH.analytics.RESERVATIONS }
                                      component={ AnalyticsReservations }
                        />

                        <PrivateRoute key={ NAV_PATH.reviewProduct }
                                      nav={ NAV.reviewProduct }
                                      exact
                                      path={ NAV_PATH.reviewProduct }
                                      component={ ReviewList }
                        />
                        <PrivateRoute key={ NAV_PATH.supplier }
                                      nav={ NAV.supplier }
                                      exact
                                      path={ NAV_PATH.supplier }
                                      hasAnyPackageFeature={ [PACKAGE_FEATURE_CODES.POS_PACKAGE, PACKAGE_FEATURE_CODES.SOCIAL_PACKAGE] }
                                      component={ SupplierList }
                        />

                        <PrivateRoute key={ NAV_PATH.inventory }
                                      nav={ NAV.inventory }
                                      exact
                                      path={ NAV_PATH.inventory }
                                      component={ InventoryList }
                        />

                        {/*CUSTOMERS*/ }
                        <PrivateRoute key={ NAV_PATH.customers.ROOT }
                                      path={ NAV_PATH.customers.ROOT }
                                      component={ CustomerList }
                                      nav={ NAV.customers.customers }
                                      exact
                        />

                        <PrivateRoute key={ NAV_PATH.customers.CUSTOMERS_LIST }
                                      path={ NAV_PATH.customers.CUSTOMERS_LIST }
                                      component={ CustomerList }
                                      nav={ NAV.customers.customers }
                                      exact
                        />

                        <PrivateRoute key={ NAV_PATH.customers.CUSTOMERS_EDIT }
                                      path={ NAV_PATH.customers.CUSTOMERS_EDIT + '/:customerId/:userId/:saleChannel' }
                                      component={ CustomerEditor }
                                      nav={ NAV.customers.customers }
                                      exact
                        />

                        <PrivateRoute key={ NAV_PATH.customers.SEGMENT_LIST }
                                      path={ NAV_PATH.customers.SEGMENT_LIST }
                                      component={ CustomerSegmentList }
                                      nav={ NAV.customers.segments }
                                      exact
                        />

                        <PrivateRoute key={ NAV_PATH.customers.SEGMENT_CREATE }
                                      path={ NAV_PATH.customers.SEGMENT_CREATE }
                                      component={ CustomerSegmentCreate }
                                      nav={ NAV.customers.segments }
                                      exact
                        />

                        <PrivateRoute key={ NAV_PATH.customers.SEGMENT_EDIT }
                                      path={ NAV_PATH.customers.SEGMENT_EDIT + '/:segmentId' }
                                      component={ CustomerSegmentEdit }
                                      nav={ NAV.customers.segments }
                                      exact
                        />

                        {/* DISCOUNT */ }
                        <PrivateRoute key={ NAV_PATH.discounts.ROOT }
                                      nav={ NAV.promotion.discounts }
                                      exact
                                      path={ NAV_PATH.discounts.ROOT }
                                      component={ DiscountList }
                        />
                        <PrivateRoute key={ NAV_PATH.discounts.DISCOUNTS_LIST }
                                      nav={ NAV.promotion.discounts }
                                      exact
                                      path={ NAV_PATH.discounts.DISCOUNTS_LIST }
                                      component={ DiscountList }
                        />
                        <PrivateRoute key={ NAV_PATH.discounts.DISCOUNTS_DETAIL }
                                      nav={ NAV.promotion.discounts }
                                      exact
                                      path={ NAV_PATH.discounts.DISCOUNTS_DETAIL + '/:discountsType/:itemId' }
                                      component={ DiscountDetail }
                        />
                        <PrivateRoute key={ NAV_PATH.discounts.DISCOUNTS_CREATE }
                                      nav={ NAV.promotion.discounts }
                                      exact
                                      path={ NAV_PATH.discounts.DISCOUNTS_CREATE + '/:discountsType' }
                                      component={ DiscountCreate }
                        />
                        <PrivateRoute key={ NAV_PATH.discounts.DISCOUNTS_EDIT }
                                      nav={ NAV.promotion.discounts }
                                      exact
                                      path={ NAV_PATH.discounts.DISCOUNTS_EDIT + '/:discountsType/:itemId' }
                                      component={ DiscountEdit }
                        />
                        <PrivateRoute key={ NAV_PATH.discounts.FLASHSALE_INTRO }
                                      nav={ NAV.promotion.flashSale }
                                      exact
                                      path={ NAV_PATH.discounts.FLASHSALE_INTRO }
                                      component={ FlashSaleIntro }
                        />

                        {/* FLASH SALE */ }
                        <PrivateRoute key={ NAV_PATH.flashSale }
                                      nav={ NAV.promotion.flashSale }
                                      exact
                                      path={ NAV_PATH.flashSale }
                                      component={ FlashSaleCampaignManagement }
                        />
                        <PrivateRoute key={ NAV_PATH.createFlashSaleCampaign }
                                      nav={ NAV.promotion.flashSale }
                                      exact
                                      path={ NAV_PATH.createFlashSaleCampaign }
                                      component={ CreateEditFlashSaleCampaign }
                        />
                        <PrivateRoute key={ NAV_PATH.flashSaleTime }
                                      nav={ NAV.promotion.flashSale }
                                      exact
                                      path={ NAV_PATH.flashSaleTime }
                                      component={ FlashSaleTimeManagement }
                        />
                        <PrivateRoute key={ NAV_PATH.editFlashSaleCampaign }
                                      nav={ NAV.promotion.flashSale }
                                      exact
                                      path={ NAV_PATH.editFlashSaleCampaign }
                                      component={ CreateEditFlashSaleCampaign }
                        />

                        {/* MARKETING */ }

                        <PrivateRoute key={ NAV_PATH.marketing.NOTIFICATION }
                                      nav={ NAV.marketing.notification }
                                      path={ NAV_PATH.marketing.NOTIFICATION }
                                      hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.APP_PACKAGE]}
                                      component={ MKNotification }
                                      exact
                        />

                        <PrivateRoute key={ NAV_PATH.marketing.BUY_LINK }
                                      nav={ NAV.marketing.buyLink }
                                      path={ NAV_PATH.marketing.BUY_LINK }
                                      component={ BuyLink }
                                      exact
                        />

                        <PrivateRoute key={ NAV_PATH.marketing.BUY_LINK_INTRO }
                                      nav={ NAV.marketing.buyLink }
                                      path={ NAV_PATH.marketing.BUY_LINK_INTRO }
                                      component={ BuyLinkIntro }
                                      exact
                        />

                        <PrivateRoute key={ NAV_PATH.marketing.EMAIL }
                                      nav={ NAV.marketing.email }
                                      path={ NAV_PATH.marketing.EMAIL }
                                      hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.WEB_PACKAGE, PACKAGE_FEATURE_CODES.APP_PACKAGE, PACKAGE_FEATURE_CODES.POS_PACKAGE, PACKAGE_FEATURE_CODES.SOCIAL_PACKAGE]}
                                      component={ MarketingEmailCampaignList }
                                      exact
                        />

                        <PrivateRoute
                            key={ NAV_PATH.marketing.EMAIL_CREATE }
                            nav={ NAV.marketing.email }
                            path={ NAV_PATH.marketing.EMAIL_CREATE }
                            hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.WEB_PACKAGE, PACKAGE_FEATURE_CODES.APP_PACKAGE, PACKAGE_FEATURE_CODES.POS_PACKAGE, PACKAGE_FEATURE_CODES.SOCIAL_PACKAGE]}
                            component={ MarketingEmailCampaignCreate }
                            exact
                        />

                        <PrivateRoute
                            key={ NAV_PATH.marketing.EMAIL_EDIT }
                            nav={ NAV.marketing.email }
                            path={ NAV_PATH.marketing.EMAIL_EDIT + '/:id' }
                            hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.WEB_PACKAGE, PACKAGE_FEATURE_CODES.APP_PACKAGE, PACKAGE_FEATURE_CODES.POS_PACKAGE, PACKAGE_FEATURE_CODES.SOCIAL_PACKAGE]}
                            component={ MarketingEmailCampaignEdit }
                            exact
                        />


                        <PrivateRoute key={ NAV_PATH.marketing.NOTIFICATION_INTRO }
                                      nav={ NAV.marketing.notification }
                                      path={ NAV_PATH.marketing.NOTIFICATION_INTRO }
                                      hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.APP_PACKAGE]}
                                      component={ NotificationIntro }
                                      exact
                        />

                        <PrivateRoute key={ NAV_PATH.marketing.NOTIFICATION_PUSH_CREATE }
                                      nav={ NAV.marketing.notification }
                                      path={ NAV_PATH.marketing.NOTIFICATION_PUSH_CREATE }
                                      hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.APP_PACKAGE]}
                                      component={ NotificationPushCampaignCreate }
                                      exact
                        />


                        <PrivateRoute key={ NAV_PATH.marketing.NOTIFICATION_PUSH_EDIT }
                                      nav={ NAV.marketing.notification }
                                      path={ NAV_PATH.marketing.NOTIFICATION_PUSH_EDIT + '/:notificationId' }
                                      hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.APP_PACKAGE]}
                                      component={ NotificationPushCampaignEdit }
                                      exact
                        />

                        <PrivateRoute key={ NAV_PATH.marketing.NOTIFICATION_EMAIL_CREATE }
                                      nav={ NAV.marketing.notification }
                                      path={ NAV_PATH.marketing.NOTIFICATION_EMAIL_CREATE }
                                      hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.APP_PACKAGE]}
                                      component={ NotificationEmailCampaignCreate }
                                      exact
                        />
                        <PrivateRoute key={ NAV_PATH.marketing.NOTIFICATION_DETAIL }
                                      nav={ NAV.marketing.notification }
                                      path={ NAV_PATH.marketing.NOTIFICATION_DETAIL + '/:notificationId' }
                                      hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.APP_PACKAGE]}
                                      component={ NotificationDetail }
                                      exact
                        />

                        <PrivateRoute key={ NAV_PATH.marketing.ROOT }
                                      nav={ NAV.marketing.landingPage }
                                      path={ NAV_PATH.marketing.ROOT }
                                      component={ LandingPage }
                                      exact
                        />
                        <PrivateRoute key={ NAV_PATH.marketing.LOYALTY_LIST }
                                      nav={ NAV.marketing.loyaltyProgram }
                                      path={ NAV_PATH.marketing.LOYALTY_LIST }
                                      component={ LoyaltyList }
                        />

                        <PrivateRoute key={ NAV_PATH.marketing.LOYALTY_EDIT + '/:itemId' }
                                      nav={ NAV.marketing.loyaltyProgram }
                                      path={ NAV_PATH.marketing.LOYALTY_EDIT + '/:itemId' }
                                      component={ LoyaltyEdit }
                                      exact
                        />
                        <PrivateRoute key={ NAV_PATH.marketing.LOYALTY_CREATE }
                                      nav={ NAV.marketing.loyaltyProgram }
                                      path={ NAV_PATH.marketing.LOYALTY_CREATE }
                                      component={ LoyaltyAddNew }
                                      exact
                        />
                        <PrivateRoute key={ NAV_PATH.marketing.LOYALTY_POINT }
                                      nav={ NAV.marketing.loyaltyPoint }
                                      path={ NAV_PATH.marketing.LOYALTY_POINT }
                                      component={ LoyaltyPointIntro }
                                      exact
                        />
                        <PrivateRoute key={ NAV_PATH.marketing.LOYALTY_POINT_INTRO }
                                      nav={ NAV.marketing.loyaltyPoint }
                                      path={ NAV_PATH.marketing.LOYALTY_POINT_INTRO }
                                      component={ LoyaltyPointIntro }
                                      exact
                        />
                        <PrivateRoute key={ NAV_PATH.marketing.LOYALTY_POINT_SETTING }
                                      nav={ NAV.marketing.loyaltyPoint }
                                      path={ NAV_PATH.marketing.LOYALTY_POINT_SETTING }
                                      component={ LoyaltyPointSetting }
                                      exact
                        />

                        <PrivateRoute key={ NAV_PATH.marketing.LANDING_PAGE }
                                      nav={ NAV.marketing.landingPage }
                                      path={ NAV_PATH.marketing.LANDING_PAGE }
                                      component={ LandingPage }
                        />

                        <PrivateRoute key={ NAV_PATH.marketing.LANDING_PAGE_CREATE }
                                      nav={ NAV.marketing.landingPage }
                                      path={ NAV_PATH.marketing.LANDING_PAGE_CREATE }
                                      component={ LandingPageCreate }
                        />

                        <PrivateRoute key={ NAV_PATH.marketing.LANDING_PAGE_EDIT }
                                      nav={ NAV.marketing.landingPage }
                                      path={ NAV_PATH.marketing.LANDING_PAGE_EDIT + '/:landingPageId' }
                                      component={ LandingPageEdit }
                        />

                        <PrivateRoute key={ NAV_PATH.marketing.GOOGLE_ANALYTICS }
                                      nav={ NAV.marketing.googleAnalytics }
                                      path={ NAV_PATH.marketing.GOOGLE_ANALYTICS }
                                      component={ GoogleAnalytics }
                        />

                        <PrivateRoute key={ NAV_PATH.marketing.GOOGLE_SHOPPING }
                                      nav={ NAV.marketing.googleShopping }
                                      path={ NAV_PATH.marketing.GOOGLE_SHOPPING }
                                      component={ GoogleShopping }
                        />

                        <PrivateRoute key={ NAV_PATH.marketing.FACEBOOK_PIXEL }
                                      nav={ NAV.marketing.facebookPixel }
                                      path={ NAV_PATH.marketing.FACEBOOK_PIXEL }
                                      component={ FacebookPixel }
                        />

                        <PrivateRoute key={ NAV_PATH.marketing.GOOGLE_TAG_MANAGER }
                                      nav={ NAV.marketing.googleTagManager }
                                      path={ NAV_PATH.marketing.GOOGLE_TAG_MANAGER }
                                      hasAnyPackageFeature={ [PACKAGE_FEATURE_CODES.WEB_PACKAGE] }
                                      component={ GoogleTagManager }
                        />

                        <Route key={ NAV_PATH.affiliate }
                               nav={ NAV.affiliate }
                               path={ NAV_PATH.affiliate }
                               component={ AffiliateDashboard }
                        />

                        {/* SHOPEE ACCOUNT */ }
                        <PrivateRoute key={ NAV.shopeeAccountIntro }
                                      exact
                                      getShopeeInfo
                                      nav={ NAV.shopeeAccountIntro }
                                      path={ NAV_PATH.shopeeAccountIntro }
                                      component={ ShopeeIntro }
                        />
                        <PrivateRoute key={ NAV.shopeeAccount }
                                      exact
                                      getShopeeInfo
                                      nav={ NAV.shopeeAccount }
                                      path={ NAV_PATH.shopeeAccount }
                                      component={ ShopeeConnector }
                        />
                        <PrivateRoute key={ NAV.shopeeAccountInformation }
                                      exact
                                      getShopeeInfo
                                      nav={ NAV.shopeeAccountInformation }
                                      path={ NAV_PATH.shopeeAccountInformation }
                                      component={ ShopeeAccount }
                        />
                        <PrivateRoute key={ NAV.shopeeProduct }
                                      exact
                                      getShopeeInfo
                                      nav={ NAV.shopeeProduct }
                                      path={ NAV_PATH.shopeeProduct }
                                      component={ ShopeeProducts }
                        />
                        <PrivateRoute key={ NAV.shopeeLinkProducts }
                                      exact
                                      getShopeeInfo
                                      nav={ NAV.shopeeLinkProducts }
                                      path={ NAV_PATH.shopeeLinkProducts }
                                      component={ ShopeeLinkProducts }
                        />
                        <PrivateRoute key={ NAV_PATH.shopeeProductList }
                                      exact
                                      getShopeeInfo
                                      nav={ NAV.shopeeProduct }
                                      path={ NAV_PATH.shopeeProductList }
                                      component={ ShopeeProductManagement }
                        />
                        <PrivateRoute key={ NAV_PATH.shopeeProduct + '/:itemId' }
                                      exact
                                      getShopeeInfo
                                      nav={ NAV.shopeeProduct }
                                      path={ NAV_PATH.shopeeProduct + '/:itemId' }
                                      component={ ShopeeEditProduct }
                        />
                        <PrivateRoute key={ NAV_PATH.shopeeEditProduct + '/:itemId' }
                                      exact
                                      getShopeeInfo
                                      nav={ NAV.shopeeProduct }
                                      path={ NAV_PATH.shopeeEditProduct + '/:itemId' }
                                      component={ ShopeeSyncEditProduct }
                        />
                        <PrivateRoute key={ NAV.shopeeAccountManagement }
                                      exact
                                      getShopeeInfo
                                      nav={ NAV.shopeeAccountManagement }
                                      path={ NAV_PATH.shopeeAccountManagement }
                                      component={ ShopeeAccountManagement }
                        />
                        <PrivateRoute key={ NAV.shopeePlans }
                                      exact
                                      getShopeeInfo
                                      nav={ NAV.shopeePlans }
                                      path={ NAV_PATH.shopeePlans }
                                      component={ SettingShopeePlans }
                        />

                        <PrivateRoute key={ NAV.shopeeSettings }
                                      exact
                                      getShopeeInfo
                                      nav={ NAV.shopeeSettings }
                                      path={ NAV_PATH.shopeeSettings }
                                      component={ shopeeSettings }
                        />

                        {/* LAZADA */ }
                        <PrivateRoute key={ NAV.lazadaAccount }
                                      exact
                                      nav={ NAV.lazadaAccount }
                                      path={ NAV_PATH.lazadaAccount }
                                      component={ LazadaAccount }
                        />
                        <PrivateRoute key={ NAV.lazadaProduct }
                                      exact
                                      nav={ NAV.lazadaProduct }
                                      path={ NAV_PATH.lazadaProduct }
                                      component={ LazadaProducts }
                        />

                        {/*TIKI*/ }
                        {/*<PrivateRoute key={NAV.tikiAccount}*/ }
                        {/*              exact*/ }
                        {/*              nav={NAV.tikiAccount}*/ }
                        {/*              path={NAV_PATH.tikiAccount}*/ }
                        {/*              component={TikiAccount}*/ }
                        {/*/>*/ }
                        {/*<PrivateRoute key={NAV.tikiProduct}*/ }
                        {/*              exact*/ }
                        {/*              nav={NAV.tikiProduct}*/ }
                        {/*              path={NAV_PATH.tikiProduct}*/ }
                        {/*              component={TikiProduct}*/ }
                        {/*/>*/ }
                        {/*<PrivateRoute key={NAV_PATH.tikiResolveCode}*/ }
                        {/*              nav={NAV.tikiResolveCode}*/ }
                        {/*              exact*/ }
                        {/*              path={NAV_PATH.tikiResolveCode}*/ }
                        {/*              component={TikiResolveCode}*/ }
                        {/*              wrapLayout={false}*/ }
                        {/*/>*/ }
                        {/*<PrivateRoute key={NAV_PATH.tikiProduct + "/:itemId"}*/ }
                        {/*              exact*/ }
                        {/*              getTikiInfo*/ }
                        {/*              nav={NAV.tikiProduct}*/ }
                        {/*              path={NAV_PATH.tikiProduct + "/:itemId"}*/ }
                        {/*              component={TikiEditProduct}*/ }
                        {/*/>*/ }
                        {/*<PrivateRoute key={NAV_PATH.tikiEditProduct + "/:itemId"}*/ }
                        {/*              exact*/ }
                        {/*              getTikiInfo*/ }
                        {/*              nav={NAV.tikiProduct}*/ }
                        {/*              path={NAV_PATH.tikiEditProduct + "/:itemId"}*/ }
                        {/*              component={TikiEditProduct}*/ }
                        {/*/>*/ }

                        {/*BEECOW*/ }
                        <PrivateRoute key={ NAV_PATH.beecowAccount }
                                      exact
                                      nav={ NAV.beecowAccount }
                                      path={ NAV_PATH.beecowAccount }
                                      component={ BeecowAccount }
                        />
                        <PrivateRoute exact
                                      path={ NAV_PATH.settings }
                                      component={ Setting }
                                      checkPackageFeature={ false }
                                      checkStaff={ true }
                                      checkExpired={ false }
                        />
                        <PrivateRoute exact
                                      path={ NAV_PATH.settingsPlans }
                                      component={ SettingPlans }
                                      checkPackageFeature={ false }
                                      checkStaff={ true }
                                      checkExpired={ false }
                        />
                        <PrivateRoute exact
                                      path={ NAV_PATH.settingsCallCenterPlans }
                                      component={ SettingCallCenterPlans }
                                      checkPackageFeature={ false }
                                      checkStaff={ true }
                                      checkExpired={ false }
                        />
                        <PrivateRoute exact
                                      path={ NAV_PATH.settingsBranchPlans }
                                      component={ SettingBranchPlans }
                                      checkPackageFeature={ false }
                                      checkStaff={ true }
                                      checkExpired={ false }
                        />
                        <PrivateRoute exact
                                      path={ NAV_PATH.settingsAffiliatePlans }
                                      component={ SettingAffiliatePlans }
                                      checkPackageFeature={ false }
                                      checkStaff={ true }
                                      checkExpired={ false }
                        />
                        <PrivateRoute exact
                                      path={ NAV_PATH.paymentCallback }
                                      component={ Callback }
                                      checkPackageFeature={ false }
                                      checkStaff={ false }
                                      checkExpired={ false }
                        />
                        <PrivateRoute exact
                                      path={ NAV_PATH.paymentCallbackEpay }
                                      component={ CallbackEPay }
                                      checkPackageFeature={ false }
                                      checkStaff={ false }
                                      checkExpired={ false }
                        />
                        <PrivateRoute exact
                                      path={ NAV_PATH.paymentCallbackChaiPay }
                                      component={ CallbackChaiPay }
                                      checkPackageFeature={ false }
                                      checkStaff={ false }
                                      checkExpired={ false }
                        />
                        <PrivateRoute exact
                                      path={ NAV_PATH.logout }
                                      component={ Logout }
                                      checkPackageFeature={ false }
                                      checkStaff={ false }
                                      checkExpired={ false }
                        />
                        <PrivateRoute exact
                                      path={ NAV_PATH.upgradeInChannel }
                                      component={ wrapperLayout(UpgradeChannelPanel) }
                                      checkPackageFeature={ false }
                                      checkStaff={ false }
                                      checkExpired={ false }
                        />

                        <PrivateRoute key={ NAV_PATH.callCenter.PATH_CALL_CENTER_HISTORY_LIST }
                                      nav={ NAV.callCenter.callHistory }
                                      exact
                                      path={ NAV_PATH.callCenter.PATH_CALL_CENTER_HISTORY_LIST }
                                      component={ CallCenterHistoryList }
                        />
                        <PrivateRoute key={ NAV_PATH.themeEngine.management }
                                      nav={ NAV.themeEngine.management }
                                      exact
                                      path={ NAV_PATH.themeEngine.management }
                                      component={ ThemeManagement }
                        />
                        <PrivateRoute key={ NAV_PATH.themeEngine.library }
                                      nav={ NAV.themeEngine.library }
                                      exact
                                      path={ NAV_PATH.themeEngine.library }
                                      component={ ThemeLibrary }
                        />
                        <Route key={ NAV_PATH.themeEngine.preview }
                               nav={ NAV.themeEngine.preview }
                               exact
                               path={ NAV_PATH.themeEngine.preview }
                               component={ ThemePreview }
                        />
                        <Route key={ NAV_PATH.previewLandingPage }
                               nav={ NAV.previewLandingPage }
                               exact
                               path={ NAV_PATH.previewLandingPage }
                               component={ LandingPagePreview }
                        />
                        <PrivateRoute key={ NAV_PATH.settingPaypal }
                                      exact
                                      nav={ NAV.settingPaypal }
                                      path={ NAV_PATH.settingPaypal }
                                      component={ PaypalConnector }
                        />
                        {/*CALL CENTER*/ }
                        <PrivateRoute key={ NAV_PATH.callCenter.ROOT }
                                      nav={ NAV.callCenter.callHistory }
                                      exact
                                      path={ NAV_PATH.callCenter.PATH_CALL_CENTER_INTRO }
                                      component={ CallCenterIntro }
                        />
                        <PrivateRoute key={ NAV_PATH.callCenter.PATH_CALL_CENTER_INTRO }
                                      nav={ NAV.callCenter.callHistory }
                                      exact
                                      path={ NAV_PATH.callCenter.PATH_CALL_CENTER_INTRO }
                                      component={ CallCenterIntro }
                        />

                        <PrivateRoute key={ NAV_PATH.callCenter.PATH_CALL_CENTER_HISTORY_LIST }
                                      nav={ NAV.callCenter.callHistory }
                                      exact
                                      path={ NAV_PATH.callCenter.PATH_CALL_CENTER_HISTORY_LIST }
                                      component={ CallCenterHistoryList }
                        />
                        <PrivateRoute key={ NAV_PATH.settingsLanguagesPlans }
                                      nav={ NAV.languagesPlans }
                                      exact
                                      path={ NAV_PATH.settingsLanguagesPlans }
                                      component={ SettingLanguagesPlans }
                        />
                        {/*CASHBOOK*/ }
                        <PrivateRoute key={ NAV_PATH.cashbook.management }
                                      nav={ NAV.cashbook.management }
                                      exact
                                      path={ NAV_PATH.cashbook.management }
                                      component={ CashbookManagement }
                                      checkPackageFeature
                                      hasAnyPackageFeature={ [PACKAGE_FEATURE_CODES.POS_PACKAGE] }
                        />
                        <Route path="*" render={ () => (<Redirect to={ NAV_PATH.notFound }/>) }/>
                    </Switch>
                </Suspense>
            </ErrorBoundary>
        </>
    );
};

const areEqual = (prevProps, nextProps) =>  _.isEqual(prevProps, nextProps);

export default withRouter(React.memo(AppRouter, areEqual));
