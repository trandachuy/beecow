/*
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 19/3/2019
 * Author: Dai Mai <email: dai.mai@mediastep.com>
 */

import React, {Component} from 'react'
import {UikNavPanel, UikNavSection} from '../../../@uik'
import './AffiliateNavigation.sass'
import authenticate from '../../../services/authenticate'
import {CredentialUtils} from '../../../utils/credential'
import {
    icoAffiliateCommission,
    icoAffiliateInfo,
    icoAffiliateInventory,
    icoAffiliateOrder,
    icoAffiliatePartner,
    icoAffiliatePayout,
    icoAffiliateSetting
} from '../../shared/gsIconsPack/gssvgico'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {TokenUtils} from '../../../utils/token'
import PrivateComponent from '../../shared/PrivateComponent/PrivateComponent'
import {ROLES} from '../../../config/user-roles'
import AlertModal from '../../shared/AlertModal/AlertModal'
import {connect} from 'react-redux'
import {NavigationKey, NavigationPath} from '../../../config/NavigationPath'
import {NavLevelOne, NavLevelTwo} from './Navigation'


/**
 * @deprecated
 *
 */
export const NAV_PATH = NavigationPath

/**
 * @deprecated
 *
 */
export const NAV = NavigationKey

const {affiliate, affiliateCommission, affiliateOrder, affiliatePartner, affiliatePayout, affiliateInventory} =  NAV_PATH;

/**
 * @deprecated
 */
 export const Level1Path = {
    affiliate, affiliateCommission, affiliateOrder, affiliatePartner, affiliatePayout, affiliateInventory
 }

function setActiveMenu(expected, navName) {
    return expected === navName || Object.values(expected).indexOf(navName) > -1 ? 'active' : '';
}

class AffiliateNavigation extends Component {
    isStaff = TokenUtils.isHasRole(ROLES.ROLE_GOSELL_STAFF)

    constructor(props) {
        super(props);

        this._isMounted = false;
        this.storeId = authenticate.getStoreId();
        this.state = {
            active: this.props.active,
            currentPackage: CredentialUtils.getPackageId(),
            onFirstLoad: false,
        };
        this.onClickCollapsibleMenu = this.onClickCollapsibleMenu.bind(this);
        this.renderCollapsibleIcon = this.renderCollapsibleIcon.bind(this);
    }

    componentDidMount() {
        this.setState({
            onFirstLoad: true
        })
        this._isMounted = true;

    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    onClickCollapsibleMenu(nav) {
        this.setState({
            onFirstLoad: false,
            active: nav
        })
    }

    renderCollapsibleIcon(nav) {
        if (setActiveMenu(nav, this.state.active) === 'active') {
            return <FontAwesomeIcon icon="angle-right"
                                    className="collapsible-icon--open"
                                    key="collapsible-icon--open"/>
        } else {
            return <FontAwesomeIcon icon="angle-right"
                                    className="collapsible-icon--close"
                                    key="collapsible-icon--close"/>
        }
    }

    render() {
        return (
            <UikNavPanel className={["nav-panel", "gs-atm__scrollbar-1", this.props.className].join(' ')}>
                <UikNavSection className="nav-section-dashboard">

                    {/*INFORMATION*/}
                    <PrivateComponent wrapperDisplay={"block"} allowUserEvents
                                      /* hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.FEATURE_0100]} */
                    >
                        <NavLevelOne active={setActiveMenu(NAV.affiliate, this.state.active)}
                                     name="page.affiliate.menu.info" url={NAV_PATH.affiliate}
                                     iconComp={icoAffiliateInfo}
                                     hiddenName={this.props.collapsedMenu}
                        />
                    </PrivateComponent>
                    {/*PARTNER*/}
                    <PrivateComponent wrapperDisplay={"block"} allowUserEvents
                                      /* hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.FEATURE_0100]} */
                    >
                        <NavLevelOne active={setActiveMenu(NAV.affiliatePartner, this.state.active)}
                                     name="page.affiliate.menu.partner" url={NAV_PATH.affiliatePartner}
                                     iconComp={icoAffiliatePartner}
                                     hiddenName={this.props.collapsedMenu}
                        />
                    </PrivateComponent>
                    {/*COMMISSION*/}
                    <PrivateComponent wrapperDisplay={"block"} allowUserEvents
                                      /* hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.FEATURE_0100]} */
                    >
                        <NavLevelOne active={setActiveMenu(NAV.affiliateCommission, this.state.active)}
                                     name="page.affiliate.menu.commission" url={NAV_PATH.affiliateCommission}
                                     iconComp={icoAffiliateCommission}
                                     hiddenName={this.props.collapsedMenu}
                        />
                    </PrivateComponent>
                    {/*ORDER*/}
                    <PrivateComponent wrapperDisplay={"block"} allowUserEvents
                                      /* hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.FEATURE_0100]} */
                    >
                        <NavLevelOne active={setActiveMenu(NAV.affiliateOrder, this.state.active)}
                                     name="page.affiliate.menu.order" url={NAV_PATH.affiliateOrder}
                                     iconComp={icoAffiliateOrder}
                                     hiddenName={this.props.collapsedMenu}
                        />
                    </PrivateComponent>
                    {/*INVENTORY*/}
                    <PrivateComponent wrapperDisplay={ 'block' } allowUserEvents>
                        <NavLevelOne
                            className={this.props.hasReseller ? '' : 'gs-atm-must-disabled'}
                            active={ setActiveMenu(NAV.affiliateInventory, this.state.active) }
                            name="page.affiliate.menu.inventory"
                            url={ NAV_PATH.affiliateInventory }
                            iconComp={ icoAffiliateInventory }
                            collapsible={ this.props.collapsible }
                            onClick={ () => this.props.hasReseller && this.onClickCollapsibleMenu(NAV.affiliateInventory.affiliateInventory) }
                            rightEl={ this.renderCollapsibleIcon(NAV.affiliateInventory) }
                            hiddenName={ this.props.collapsedMenu }
                            disable={ !this.props.hasReseller }
                        />
                        {
                            setActiveMenu(NAV.affiliateInventory, this.state.active) === 'active' ?
                                <UikNavSection
                                    className={ ['nav-secondary-section', this.props.collapsedMenu ? 'nav-secondary-section--closed' : 'nav-secondary-section--opened', this.state.onFirstLoad ? '' : 'nav-secondary-section--ani'].join(' ') }>
                                    <PrivateComponent wrapperDisplay={ 'block' } allowUserEvents>
                                        <NavLevelTwo
                                            active={ setActiveMenu(NAV.affiliateInventory.affiliateInventory, this.state.active) }
                                            name="page.affiliate.menu.inventory.trackingStock"
                                            url={ NAV_PATH.affiliateInventory }/>
                                    </PrivateComponent>
                                    <PrivateComponent wrapperDisplay={ 'block' } allowUserEvents>
                                        <NavLevelTwo
                                            active={ setActiveMenu(NAV.affiliateInventory.affiliateTransferGoods, this.state.active) }
                                            name="page.affiliate.menu.inventory.transferGoods"
                                            url={ NAV_PATH.partnerTransferStock }/>
                                    </PrivateComponent>
                                </UikNavSection>
                                :
                                null
                        }
                    </PrivateComponent>
                    {/*PAYOUT*/}
                    <PrivateComponent wrapperDisplay={"block"} allowUserEvents
                                      /* hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.FEATURE_0100]} */
                    >
                        <NavLevelOne active={setActiveMenu(NAV.affiliatePayout, this.state.active)}
                                     name="page.affiliate.menu.payout" url={NAV_PATH.affiliatePayout}
                                     iconComp={icoAffiliatePayout}
                                     hiddenName={this.props.collapsedMenu}
                        />
                    </PrivateComponent>
                    {/*SETTING*/}
                    <PrivateComponent wrapperDisplay={"block"} allowUserEvents
                                      /* hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.FEATURE_0100]} */
                    >
                        <NavLevelOne active={setActiveMenu(NAV.affiliateSetting, this.state.active)}
                                     name="page.affiliate.menu.setting" url={NAV_PATH.affiliateSetting}
                                     iconComp={icoAffiliateSetting}
                                     hiddenName={this.props.collapsedMenu}
                        />
                    </PrivateComponent>
                </UikNavSection>
                <AlertModal ref={(el) => {
                    this.alertModal = el
                }}/>
            </UikNavPanel>
        );
    }
}

AffiliateNavigation.defaultProps = {
    collapsible: false,
    hasDropShip: false,
    hasReseller: false,
}

function mapStateToProps(state) {
    return {
        collapsedMenu: state.collapsedMenu,
    }
}


export default connect(mapStateToProps)(AffiliateNavigation);
