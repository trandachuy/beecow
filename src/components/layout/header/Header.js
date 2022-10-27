import React, {Component} from 'react';
import {UikTopBar, UikTopBarSection} from '../../../@uik';
import Constants from '../../../config/Constant';
import './Header.sass';
import LogoutButton from '../logoutButton/LogoutButton';
import LanguageSelector from '../languageSelector/LanguageSelector';
import StoreFrontInfo from '../../shared/StoreFrontInfo/StoreFrontInfo';
import {CredentialUtils} from '../../../utils/credential';
import {icoFlagEn, icoFlagVi, icoGoSell} from '../../shared/gsIconsPack/gssvgico';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import {cancelablePromise} from '../../../utils/promise';
import accountService from '../../../services/AccountService';
import storageService from '../../../services/storage';
import GSTrans from '../../shared/GSTrans/GSTrans';
import {NAV_PATH} from '../navigation/Navigation';
import {Link, withRouter} from 'react-router-dom';
import {connect} from 'react-redux';
import {setCollapsedMenu} from '../../../config/redux/Reducers';
import store from '../../../config/redux/ReduxStore';

import GSImg from '../../shared/GSImg/GSImg';
import i18next from 'i18next';
import IntercomDownloadModal from '../../../pages/intercom/IntercomDownloadModal';
import {ThemeEngineSwitchNotification} from '../ThemeEngineSwitchNotification/ThemeEngineSwitchNotification';
import {StickyNotification} from '../ThemeEngineSwitchNotification/StickyNotification/StickyNotification';
import ConfirmSwitchPopup from '../ThemeEngineSwitchNotification/ConfirmSwitchPopup/ConfirmSwitchPopup';
import userThemeEngineService from '../../../services/UserThemeEngineService';
import {ItemService} from '../../../services/ItemService';
import {generatePath} from 'react-router-dom/cjs/react-router-dom.min';
import {ThemeEngineService} from '../../../services/ThemeEngineService';
import moment from 'moment';
import {RouteUtils} from '../../../utils/route';
import Recommendation from './Recommendation/Recommendation'

const supportChatLabels = {
    supportBtn: i18next.t("component.navigation.supportChat"),
};

const SCREEN_TYPE = {
    TABLET: 'TABLET',
    MOBILE: 'MOBILE'
}

class Header extends Component {

    constructor(props) {
        super(props);

        this.state = {
            isShowDownloadIntercomModal: false,
            showSwitchThemeEngineNotification: false,
            isRefresh: false,
            isNotificationForTablet: false,
            isNotificationForMobile: false
        }

        this.currentLangKey = CredentialUtils.getLangKey();
        this.onClickLeftMenu = this.onClickLeftMenu.bind(this);
        this.onToggleCollapsedMenu = this.onToggleCollapsedMenu.bind(this);
        this.toggleDownloadIntercomModal = this.toggleDownloadIntercomModal.bind(this);
        this.onToggleCollapsedMenu = this.onToggleCollapsedMenu.bind(this);
        this.handleDownloadIntercomClose = this.handleDownloadIntercomClose.bind(this);
        this.closeSwitchThemeEngineNotification = this.closeSwitchThemeEngineNotification.bind(this);
        this.closeSwitchThemeEngineStickyNotification = this.closeSwitchThemeEngineStickyNotification.bind(this);
        this.handleIsNotification = this.handleIsNotification.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        if (!this.state.isRefresh && nextProps.location.state === 'refresh') {
          this.setState({
            isRefresh: true,
          }, () => window.location.reload());
        }
    }

    componentDidMount() {
        const useNewThemeEngine = CredentialUtils.getThemeEngine();

        if (useNewThemeEngine === "") {
            this.setState({showSwitchThemeEngineNotification: true});
        } else if (useNewThemeEngine === "false") {
            this.setState({showSwitchThemeStickyNotification: true});
        } else if (useNewThemeEngine === "true") {
            this.setState({
                showSwitchThemeEngineNotification: false
            });
        }

        CredentialUtils.getStoreId() && !CredentialUtils.getPublishedTheme() && ThemeEngineService.checkPublishNewTheme()
            .then(isPublished => {
                this.setState({ showSwitchThemeStickyNotification: !this.state.showSwitchThemeEngineNotification && !isPublished });
                CredentialUtils.setPublishedTheme(isPublished)
            })
            .catch((xhr) => {
                const status = (xhr && xhr.response)? (xhr.response.status): Constants.HTTP_STATUS_NOT_FOUND;
                if (status === Constants.HTTP_STATUS_NOT_FOUND) {
                    // could not found publish theme
                    CredentialUtils.setPublishedTheme(false);
                    if (this.state.showSwitchThemeEngineNotification) {
                        this.setState({ showSwitchThemeStickyNotification: false });
                    }
                    else {
                        const lastDate = `${process.env.LAST_SUPPORT_OLD_ENGINE_DATE || storageService.getFromLocalStorage(Constants.STORAGE_KEY_LAST_SUPPORT_OLD_ENGINE_DATE)}`;
                        const isAfterLastSupportDate = moment(new Date()).isAfter(moment(lastDate, "DD/MM/YYYY"));
                        if (isAfterLastSupportDate) {
                            this.setState({
                                showSwitchThemeEngineNotification: true,
                                showSwitchThemeStickyNotification: false,
                            });
                            if (window.location.href.includes("/theme/management") || window.location.href.includes("/theme/library")) {
                                this.setState({
                                    showSwitchThemeEngineNotification: false,
                                });
                            }
                        }
                        else {
                            this.setState({ showSwitchThemeStickyNotification: true });
                        }
                    }
                }
            });
    }

    onClickLeftMenu() {
        this.props.onClickLeftMenu()
    }

    onChangeLanguage(langKey) {
        // Update language key to server
        this.pmUpdateLanguage = cancelablePromise(accountService.updateUserLanguage(langKey))
        //const result = await this.pmUpdateLanguage.promise

        storageService.setToLocalStorage(Constants.STORAGE_KEY_LANG_KEY, langKey)

        // i18next.changeLanguage(value.value)
        window.location.reload()
    }

    openTutorialLink(e) {
        e && e.preventDefault() && e.stopPropagation();
        window.open(generatePath("https://huongdan.gosell.vn/"), "_blank");
    }

    handleIsNotification(e, screenType) {
        e && e.preventDefault() && e.stopPropagation();

        if (SCREEN_TYPE.TABLET == screenType) {
            this.setState(state => ({
                isNotificationForTablet: !state.isNotificationForTablet
            }))
        } else {
            this.setState(state => ({
                isNotificationForMobile: !state.isNotificationForMobile
            }))
        }
    }

    toggleDownloadIntercomModal(e) {
        e && e.preventDefault()
        this.setState(state => ({isShowDownloadIntercomModal: !state.isShowDownloadIntercomModal}))
    }

    onToggleCollapsedMenu() {
        this.props.dispatch(setCollapsedMenu(!this.props.collapsedMenu))
    }

    handleDownloadIntercomClose() {
        this.setState({isShowDownloadIntercomModal: false})
    }

    closeSwitchThemeEngineNotification(switchNow) {
        const storeId = storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_ID);
        userThemeEngineService.updateUserThemeEngine(storeId, switchNow);

        // create menu default
        if (switchNow) {
            ItemService.createMenuDefault(storeId)
                .then(res => {
                }).catch(error => {
            })
                // migrate new custom page
                .finally(() => ItemService.migrateToNewCustomPage().then(value => console.debug('Finished migrate custom pages')));
        }

        CredentialUtils.setThemeEngine(false); // not yet use new theme engine, until publish

        this.setState({
            showSwitchThemeEngineNotification: false,
            showSwitchThemeStickyNotification: !switchNow,
        });
        storageService.setToLocalStorage("showOpenThemesPopup", switchNow);
        storageService.setToLocalStorage("useNewThemeMenu", switchNow);
    }

    closeSwitchThemeEngineStickyNotification() {
        const useNewThemeEngine = true;

        // have to cheat this because uik render the top menu twice which causes state lost
        storageService.setToLocalStorage("showOpenThemesPopup", useNewThemeEngine);

        storageService.setToLocalStorage("useNewThemeMenu", true);

        const storeId = storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_ID);
        userThemeEngineService.updateUserThemeEngine(storeId, useNewThemeEngine);

        // create menu default
        if (useNewThemeEngine) {
            ItemService.createMenuDefault(storeId)
                .then(res => {
                }).catch(error => {
            })
                // migrate new custom page
                .finally(() => ItemService.migrateToNewCustomPage().then(value => console.debug('Finished migrate custom pages')));
        }
        this.setState({ showSwitchThemeStickyNotification: false });
    }

    render() {
        const {
            showSwitchThemeEngineNotification,
            showSwitchThemeStickyNotification,
        } = this.state;
        const showOpenThemesPopup = storageService.getFromLocalStorage("showOpenThemesPopup") === "true";

        return (
            <>
                {showSwitchThemeEngineNotification &&
                <ThemeEngineSwitchNotification closeNotification={this.closeSwitchThemeEngineNotification}/>
                }

                {showOpenThemesPopup &&
                <ConfirmSwitchPopup/>
                }

                {showSwitchThemeStickyNotification &&
                    <StickyNotification closeNotification={this.closeSwitchThemeEngineStickyNotification} />
                }

                <IntercomDownloadModal isShow={this.state.isShowDownloadIntercomModal}
                                       onClose={this.handleDownloadIntercomClose}/>
                <UikTopBar className="layout-top-bar">
                    <UikTopBarSection
                        className={["section-app-name", this.props.collapsedMenu ? 'section-app-name--closed' : 'section-app-name--opened'].join(' ')}>
                        {/*WEB ONLY*/}
                        <div
                            className="layout-top-bar__title-wrapper  d-mobile-none d-tablet-none d-desktop-exclude-tablet-flex">
                            <div className="layout-top-bar__hamburger" onClick={this.onToggleCollapsedMenu}>

                            </div>
                            <div onClick={() => RouteUtils.redirectWithReload(this.props, NAV_PATH.home)}
                                style={{
                                    backgroundImage: `url(${store.getState().whiteLogo || store.getState().logo || icoGoSell})`,
                                    backgroundPosition: 'center',
                                    backgroundSize: 'contain',
                                    width: '100px',
                                    height: '50px',
                                    backgroundRepeat: 'no-repeat',
                                    cursor: 'pointer'
                                }}
                                className="title-app-name"
                            />
                        </div>

                        {/*MOBILE ONLY*/}
                        <div
                            className="d-mobile-flex d-tablet-flex d-desktop-exclude-tablet-none title-app-name--mobile">
                            <div className="logo-wrapper">
                                <FontAwesomeIcon icon="bars"
                                                 className="nav-icon"
                                                 onClick={this.onClickLeftMenu}
                                />
                                <div style={{
                                    backgroundImage: `url(${store.getState().whiteLogo || store.getState().logo || icoGoSell})`,
                                    backgroundPosition: 'center',
                                    backgroundSize: 'contain',
                                    width: '100px',
                                    height: '50px',
                                    marginLeft: '1em',
                                    backgroundRepeat: 'no-repeat'
                                }}/>
                            </div>
                            <div className="store-info-wrapper">
                                <StoreFrontInfo/>
                                <Recommendation toggle={ this.state.isNotificationForMobile }/>
                                <GSImg
                                    id="tutorialBtn"
                                    className="cursor--pointer"
                                    src="/assets/images/bell_icon.svg"
                                    height={32}
                                    style={{
                                        marginLeft: "12px"
                                    }}
                                    onClick={e => this.handleIsNotification(e, SCREEN_TYPE.MOBILE)}>
                                </GSImg>
                                {!CredentialUtils.isStoreXxxOrGoSell() &&
                                <GSImg
                                    id="tutorialBtn"
                                    className="cursor--pointer"
                                    src="/assets/images/icon-tutorial-2.svg"
                                    height={32}
                                    style={{
                                        marginLeft: "12px"
                                    }}
                                    onClick={this.openTutorialLink}>
                                </GSImg>}

                                {
                                    (process.env.ENABLE_CRISP == 'true' || process.env.ENABLE_INTERCOM == 'true') &&
                                    <GSImg
                                        id="supportBtn-mobile"
                                        className="more-icon cursor--pointer"
                                        src="/assets/images/icon_supportchat.svg"
                                        width={28}
                                        alt={supportChatLabels.supportBtn}
                                        onClick={() => {
                                            process.env.ENABLE_CRISP == 'true' && window.$crisp.push(['do', 'chat:open']);
                                        }}
                                    ></GSImg>
                                }

                                <FontAwesomeIcon icon="ellipsis-h"
                                                 className="more-icon"
                                                 id="expandMenu"
                                                 data-toggle="dropdown"
                                                 aria-haspopup="true"
                                                 aria-expanded="false"
                                                 style={{cursor: 'pointer'}}
                                />

                                <div className="dropdown-menu expand-menu"
                                     aria-labelledby="expandMenu">
                                    <div className="dropdown-item">
                                        <span className="language-title">
                                            <GSTrans t="layout.header.expandMenu.language"/>
                                        </span>
                                    </div>

                                    <div className="dropdown-item lang-item"
                                         onClick={() => this.onChangeLanguage('en')}
                                    >
                                        <div className="flag-wrapper">
                                            <span className="selected-flag"
                                                  style={{background: `url(${icoFlagEn}) no-repeat center`}}/>
                                            ENG
                                        </div>
                                        {this.currentLangKey === 'en' &&
                                        <div>
                                            <span className="dot-green"/>
                                        </div>
                                        }
                                    </div>
                                    <div className="dropdown-item lang-item"
                                         onClick={() => this.onChangeLanguage('vi')}
                                    >
                                        <div className="flag-wrapper">
                                            <span className="selected-flag"
                                                  style={{background: `url(${icoFlagVi}) no-repeat center`}}/>
                                            VIE
                                        </div>
                                        {this.currentLangKey === 'vi' &&
                                        <div>
                                            <span className="dot-green"/>
                                        </div>
                                        }
                                    </div>
                                    <div className="dropdown-divider"/>
                                    <div className="dropdown-item btn-logout">
                                        <Link to={{pathname: NAV_PATH.logout, state: "refresh"}}>
                                            <FontAwesomeIcon icon={"sign-out-alt"} color="gray" style={{width: '32px'}}
                                                             size={"lg"}/>
                                            {' '}
                                            <GSTrans t={"component.logout.label.logout"}/>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </UikTopBarSection>

                    <UikTopBarSection
                        className="header-right d-mobile-none d-tablet-none d-desktop-exclude-tablet-inline-flex">
                        <Recommendation toggle={ this.state.isNotificationForTablet } style={{border: "1px solid #DDE0E9"}}/>
                        <StoreFrontInfo className="header-right__ele-left"/>
                        <div className="header-right__ele-right">
                            <GSImg
                                id="tutorialBtn"
                                className="cursor--pointer"
                                src="/assets/images/bell_icon.svg"
                                style={{
                                    // margin: "0px 30px",
                                    padding: "0px 6px"
                                }}
                                height={30}
                                onClick={e => this.handleIsNotification(e, SCREEN_TYPE.TABLET)}>
                            </GSImg>
                            {!CredentialUtils.isStoreXxxOrGoSell() &&
                            <GSImg
                                id="tutorialBtn"
                                className="cursor--pointer"
                                src="/assets/images/icon-tutorial-2.svg"
                                style={{
                                    // margin: "0px 30px",
                                    padding: "0px 6px",
                                    marginLeft:"1.5rem"
                                }}
                                height={30}
                                onClick={this.openTutorialLink}>
                            </GSImg>
                            }
                            {
                                (process.env.ENABLE_CRISP == 'true' || process.env.ENABLE_INTERCOM == 'true') && <GSImg
                                    id="supportBtn-desktop"
                                    className="cursor--pointer"
                                    src="/assets/images/icon_supportchat.svg"
                                    height={28}
                                    style={{
                                        marginLeft: "30px",
                                        padding: "0px 6px"
                                    }}
                                    alt={supportChatLabels.supportBtn}
                                    onClick={() => {
                                        process.env.ENABLE_CRISP == 'true' && window.$crisp.push(['do', 'chat:open']);
                                    }}
                                ></GSImg>
                            }
                            <LanguageSelector/>
                            <LogoutButton confirmRequired={false}/>
                        </div>
                    </UikTopBarSection>

                </UikTopBar>
            </>
        );
    }
}

function mapStateToProps(state) {
    return {
        collapsedMenu: state.collapsedMenu,
        logo: state.logo,
        whiteLogo: state.whiteLogo
    }
}


export default connect(mapStateToProps)(withRouter(Header));

Header.propTypes = {
    toggleLeftMenu: PropTypes.any
}
