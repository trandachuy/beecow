import React, {Component} from 'react';
import GSContentContainer from "../../components/layout/contentContainer/GSContentContainer";
import GSContentHeader from "../../components/layout/contentHeader/GSContentHeader";
import i18next from "i18next";
import GSContentBody from "../../components/layout/contentBody/GSContentBody";
import './Setting.sass'
import {Trans} from "react-i18next";
import classNames from 'classnames';
import Constants from "../../config/Constant";
import GSContentFooter from "../../components/layout/GSContentFooter/GSContentFooter";
import GSLearnMoreFooter from "../../components/shared/GSLearnMoreFooter/GSLearnMoreFooter";
import {Col, Nav, NavItem, NavLink, Row, TabContent, TabPane} from "reactstrap";
import BankAccountInformation from "./BankAccountInformation/BankAccountInformation";
import CurrentPlanInfo from "./CurrentPlanInfo/CurrentPlanInfo";
import AccountInfo from "./AccountInfo/AccountInfo";
import CreditHistory from "./CreditHistory/CreditHistory";
import ResetPasswordSetting from "./ResetPasswordSetting/ResetPasswordSetting";
import * as queryString from 'query-string';
import StoreInfo from "./StoreInfo/StoreInfo";
import StaffManagement from "./StaffManagement/StaffManagement";
import {TokenUtils} from "../../utils/token";
import {NAV_PATH} from "../../components/layout/navigation/Navigation";
import {RouteUtils} from "../../utils/route";
import {ROLES} from "../../config/user-roles";
import CallCenter from "./CallCenter/CallCenter";
import storageService from "../../services/storage";
import BranchManagement from './BranchMangement/BranchManagement';
import VAT from './VAT/VAT';
import StoreLanguages from './StoreLanguages/StoreLanguages'
import ShippingAndPayment from "./ShippingAndPayment/ShippingAndPayment";
import paymentService from '../../services/PaymentService';
import {CurrencyUtils} from "../../utils/number-format";

export const SettingContext = React.createContext({});


class Setting extends Component {

    constructor(props) {
        super(props);

        // check role
        const isStaff = TokenUtils.isHasRole(ROLES.ROLE_GOSELL_STAFF)
        const allowAccessThisPage = TokenUtils.isAllowForRoute(NAV_PATH.setting.ROOT)
        if (isStaff && !allowAccessThisPage) {
            RouteUtils.redirectTo('/')
        }

        this.const = {
            TAB_ACCOUNT: 1,
            TAB_SHIPPING: 2,
            TAB_BANK_INFO: 3,
            TAB_CREDIT_HISTORY: 4,
            TAB_STORE: 5,
            TAB_CHECKOUT: 6,
            TAB_STAFF_MANAGEMENT: 7,
            TAB_BRANCH_MANAGEMENT: 8,
            TAB_VAT: 9,
            TAB_LANGUAGES: 10,

        };

        const queryParams = queryString.parse(this.props.location.search);
        const tabId = queryParams['tabId'];

        this.state = {
            isSaving: false,
            isFetching: false,
            activeTab: tabId ? parseInt(tabId) : this.const.TAB_ACCOUNT,
            store: {
                isOpenByBankTransfer: false,
                openBankInfoForBankTransfer: (status) => {
                    if (status) {
                        this.setState({
                            activeTab: this.const.TAB_BANK_INFO
                        });
                    }
                    this.setState(state => ({
                        store: {
                            ...state.store,
                            isOpenByBankTransfer: status
                        }
                    }))
                },
                resetPaymentMethods: false,
                setResetPaymentMethods: (status) => {
                    this.setState(state => ({
                        store: {
                            ...state.store,
                            resetPaymentMethods: status
                        }
                    }))
                },
                storePickUpAddressProvince: '',
                setStorePickUpAddressProvince: (province) => {
                    this.setState(state => ({
                        store: {
                            ...state.store,
                            storePickUpAddressProvince: province
                        }
                    }))
                }
            }
        };

        this.toggle = this.toggle.bind(this);
    }

    componentDidMount() {
        this.createPaypalLink();
    }

    componentWillUnmount() {

    }

    async createPaypalLink() {
        try {
            const url = await paymentService.getPaypalConnectUrl();
            storageService.setToSessionStorage(Constants.STORAGE_KEY_PAYPAL_LINK, url);
         } catch(e){
           console.error(e);
         }
    }

    toggle(tab) {
        this.setState(state => ({
            store: {
                ...state.store,
                isOpenByBankTransfer: false
            }
        }));
        if (this.state.activeTab !== tab) {
            this.setState({
                activeTab: tab
            });
        }
    }

    render() {
        return (
            <SettingContext.Provider value={this.state.store}>
                <GSContentContainer className="setting" isLoading={this.state.isFetching}>
                    {/*<div className="setting_title_container gs-atm__flex-col--flex-center">*/}
                    <GSContentHeader title={i18next.t("page.setting.main.title")} size={GSContentBody.size.EXTRA}/>
                    {/*</div>*/}

                    <GSContentBody size={GSContentBody.size.EXTRA} className="flex-grow-1">
                        <Row>
                            <Col md={3}>
                                <Nav tabs vertical pills>
                                    <NavItem>
                                        <NavLink
                                            className={classNames({active: this.state.activeTab === this.const.TAB_ACCOUNT})}
                                            onClick={() => {
                                                this.toggle(this.const.TAB_ACCOUNT);
                                            }}>
                                            <Trans i18nKey="page.setting.account.title">
                                                Account
                                            </Trans>
                                        </NavLink>
                                    </NavItem>
                                    <NavItem>
                                        <NavLink
                                            className={classNames({active: this.state.activeTab === this.const.TAB_STORE})}
                                            onClick={() => {
                                                this.toggle(this.const.TAB_STORE);
                                            }}>
                                            <Trans i18nKey="page.setting.storeInformation.title">
                                                Store Information
                                            </Trans>
                                        </NavLink>
                                    </NavItem>
                                    {/*<NavItem>*/}
                                    {/*    <NavLink*/}
                                    {/*        className={classNames({active: this.state.activeTab === this.const.TAB_CHECKOUT})}*/}
                                    {/*        onClick={() => {*/}
                                    {/*            this.toggle(this.const.TAB_CHECKOUT);*/}
                                    {/*        }}>*/}
                                    {/*        <Trans i18nKey="page.setting.checkout.menu">*/}
                                    {/*            Checkout*/}
                                    {/*        </Trans>*/}
                                    {/*    </NavLink>*/}
                                    {/*</NavItem>*/}
                                    <NavItem>
                                        <NavLink
                                            className={classNames({active: this.state.activeTab === this.const.TAB_SHIPPING})}
                                            onClick={() => {
                                                this.toggle(this.const.TAB_SHIPPING);
                                            }}>
                                            <Trans i18nKey="page.setting.shippingAndPayment.title">
                                                Shipping & Payment
                                            </Trans>
                                        </NavLink>
                                    </NavItem>
                                    <NavItem>
                                        <NavLink
                                            className={classNames({active: this.state.activeTab === this.const.TAB_BANK_INFO})}
                                            onClick={() => {
                                                this.toggle(this.const.TAB_BANK_INFO);
                                            }}>
                                            <Trans i18nKey="page.setting.bankInfo.title">
                                                Banking Account Information
                                            </Trans>
                                        </NavLink>
                                    </NavItem>
                                    <NavItem>
                                        <NavLink
                                            className={classNames({active: this.state.activeTab === this.const.TAB_STAFF_MANAGEMENT})}
                                            onClick={() => {
                                                this.toggle(this.const.TAB_STAFF_MANAGEMENT);
                                            }}>
                                            <Trans i18nKey="page.setting.staff.staffManagement">
                                                Staff management
                                            </Trans>
                                        </NavLink>
                                        {/* </PrivateComponent> */}
                                    </NavItem>
                                    <NavItem>
                                        {/* <PrivateComponent wrapperDisplay={"block"}
                                                          hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.FEATURE_0288]}
                                        > */}
                                        <NavLink
                                            className={classNames({active: this.state.activeTab === this.const.TAB_BRANCH_MANAGEMENT})}
                                            onClick={() => {
                                                this.toggle(this.const.TAB_BRANCH_MANAGEMENT);
                                            }}>
                                            <Trans i18nKey="page.setting.branch.branchManagement">
                                                Branch management
                                            </Trans>
                                        </NavLink>
                                        {/* </PrivateComponent> */}
                                    </NavItem>
                                    <NavItem>
                                        {/* <PrivateComponent wrapperDisplay={"block"}
                                                          hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.FEATURE_0288]}
                                        > */}
                                        <NavLink
                                            className={classNames({active: this.state.activeTab === this.const.TAB_VAT})}
                                            onClick={() => {
                                                this.toggle(this.const.TAB_VAT);
                                            }}>
                                            <Trans i18nKey="page.setting.VAT.titleBox">
                                                VAT
                                            </Trans>
                                        </NavLink>
                                        {/* </PrivateComponent> */}
                                    </NavItem>
                                    <NavItem>
                                        {/* <PrivateComponent wrapperDisplay={"block"}
                                                          hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.FEATURE_0288]}
                                        > */}
                                        <NavLink
                                            className={classNames({active: this.state.activeTab === this.const.TAB_LANGUAGES})}
                                            onClick={() => {
                                                this.toggle(this.const.TAB_LANGUAGES);
                                            }}>
                                            <Trans i18nKey="page.setting.languages.title">
                                                Store Languages
                                            </Trans>
                                        </NavLink>
                                        {/* </PrivateComponent> */}
                                    </NavItem>
                                </Nav>
                            </Col>
                            <Col md={9}>
                                <TabContent activeTab={this.state.activeTab}>
                                    <TabPane tabId={this.const.TAB_ACCOUNT}>
                                        {/*ACCOUNT*/}
                                        <CurrentPlanInfo/>

                                        {/*CALL CENTER*/}
                                        <CallCenter/>

                                        {/*ACCOUNT INFO*/}
                                        <AccountInfo/>

                                        {/*RESET PASSWORD*/}
                                        <ResetPasswordSetting/>
                                    </TabPane>

                                    <TabPane tabId={this.const.TAB_STORE}>
                                        <StoreInfo/>
                                    </TabPane>

                                    {/*<TabPane tabId={this.const.TAB_CHECKOUT}>*/}
                                    {/*    <CheckoutInfo/>*/}
                                    {/*</TabPane>*/}

                                    <TabPane tabId={this.const.TAB_SHIPPING}>
                                        <ShippingAndPayment/>
                                    </TabPane>

                                    <TabPane tabId={this.const.TAB_BANK_INFO}>
                                        {/*BANKING ACCOUNT INFO*/}
                                        <BankAccountInformation/>
                                    </TabPane>

                                    <TabPane tabId={this.const.TAB_CREDIT_HISTORY}>
                                        <CreditHistory/>
                                    </TabPane>

                                    <TabPane tabId={this.const.TAB_STAFF_MANAGEMENT}>
                                        <StaffManagement/>
                                    </TabPane>

                                    <TabPane tabId={this.const.TAB_BRANCH_MANAGEMENT}>
                                        <BranchManagement/>
                                    </TabPane>
                                    <TabPane tabId={this.const.TAB_VAT}>
                                        <VAT/>
                                    </TabPane>
                                    <TabPane tabId={this.const.TAB_LANGUAGES}>
                                        <StoreLanguages/>
                                    </TabPane>

                                </TabContent>

                            </Col>
                        </Row>
                    </GSContentBody>

                    <GSContentFooter>
                        <GSLearnMoreFooter
                            text={i18next.t("page.setting.main.title")}
                            linkTo={Constants.UrlRefs.LEARN_MORE_ACCOUNT_SETTING}/>
                    </GSContentFooter>
                </GSContentContainer>
            </SettingContext.Provider>
        );
    }
}

export default Setting;
