import React, {Component} from 'react';
import './@stringee/stringee-web-sdk.min';
import {BrowserRouter} from 'react-router-dom';
import './config/fas';
import {
    setAgencyDomain,
    setAgencyName,
    setAgencyZaloApp,
    setLogo,
    setPageTitle,
    setWhiteLogo,
    setRefCode
} from './config/redux/Reducers';
import {connect} from 'react-redux';
import {handleGetUserConfirmation} from './components/layout/leaveConfirm/LeaveConfirmation';
import {toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import beehiveService from './services/BeehiveService';
import {Helmet} from 'react-helmet/es/Helmet';
import store from './config/redux/ReduxStore';
import GSTourGuide from './components/shared/GSTourGuide/GSTourGuide';
import {CredentialUtils} from './utils/credential';
import storage from './services/storage';
import storageService from './services/storage';
import Constants from './config/Constant';
import userThemeEngineService from './services/UserThemeEngineService';
import moment from 'moment';
import {DateTimeUtils} from './utils/date-time';
import 'font-awesome/css/font-awesome.min.css';
import AlertModal, {AlertModalType} from './components/shared/AlertModal/AlertModal';
import i18next from 'i18next';
import {TokenUtils} from './utils/token';
import storeService from './services/StoreService';
import GSTrans from './components/shared/GSTrans/GSTrans';
import Cookies from 'js-cookie';
import RouterRenderController from './RouterRenderController'

toast.configure({
    newestOnTop: true,
    hideProgressBar: true,
    closeOnClick: true,
    position: "bottom-center",
    pauseOnHover: true,
    autoClose: 5000,
});

class App extends Component {
    constructor(props) {
        super(props);
        this.props.dispatch(setPageTitle(process.env.APP_NAME));
        this.updateFavicon = this.updateFavicon.bind(this);
        this.updateAgencyContext = this.updateAgencyContext.bind(this);
        this.showForceLogout = this.showForceLogout.bind(this);
        this.doLogout = this.doLogout.bind(this);

        Cookies.set('apiBaseUrl', process.env.API_BASE_URL)
    }

    componentDidMount() {
        const agencyCode = beehiveService.getAgencyCode();
        const curPath = window.location.pathname;
        if (Constants.EXCLUDE_PATHS.EXCLUDE_PATHS.indexOf(curPath) === -1 && agencyCode) {
            beehiveService.getAgencyInfo(agencyCode)
                .then(value => {
                    this.updateFavicon(value.logo);
                    this.updateAgencyContext(value);
                })
                .catch(error => {
                    console.error(error);
                    window.location.href = '/404'
                })
        }
    }

    componentDidUpdate(prevProps, prevState) {
        let self = this;
        setTimeout(() => {
            self.showForceLogout()
        }, 1000);
    }

    showForceLogout() {
        const resolveModalMessage = () => {
            const msgList = (storageService.getFromSessionStorage(Constants.STORAGE_KEY_FORCE_LOGOUT_MSG) || 'common.message.forceLogout')
                .split('|')

            return (
                <>
                    {msgList.map(i18Key => (
                        <>
                            <GSTrans t={i18Key}/>
                            <br/>
                        </>
                    ))}
                </>
            )
        }


        const forceLogout = storage.get(Constants.STORAGE_KEY_FORCE_LOGOUT);
        if (forceLogout) {
            console.log('force logout')
            this.alertModal.openModal({
                type: AlertModalType.ALERT_TYPE_OK,
                modalTitle: i18next.t('common.txt.alert.modal.title'),
                messages: resolveModalMessage(),
                closeCallback: this.doLogout,
                modalBtn: i18next.t('common.txt.alert.modal.logout')
            });
        }
    }

    doLogout() {
        storage.removeSessionStorage(Constants.STORAGE_KEY_FORCE_LOGOUT);
        window.location.href = '/logout';
    }

    render() {
        return (
            <div>
                {/*<NoInternet/>*/}
                <Helmet>
                    <meta name='title' content={store.getState().pageTitle}/>
                    <title>{store.getState().pageTitle}</title>
                </Helmet>
                <BrowserRouter getUserConfirmation={handleGetUserConfirmation}>
                    <RouterRenderController />
                    <GSTourGuide key={CredentialUtils.getAccessToken() + this.props.agencyName}
                                 provider={this.props.agencyName}/>
                </BrowserRouter>
                <AlertModal ref={(el) => {
                    this.alertModal = el
                }}/>
            </div>
        );
    }

    updateFavicon(ico) {
        if (ico) {
            let head = document.head;
            let links = head.getElementsByTagName('link');
            if (links) {
                for (let link of links) {
                    if (link.rel === 'shortcut icon' || link.rel === 'icon') {
                        head.removeChild(link)
                    }
                }
                let favicon = document.createElement('link');
                favicon.setAttribute('rel', 'shortcut icon');
                favicon.setAttribute('href', ico);
                head.appendChild(favicon);
            }
        }
    }

    updateAgencyContext(value) {
        this.props.dispatch(setLogo(value.logo));
        this.props.dispatch(setWhiteLogo(value.whiteLogo));
        this.props.dispatch(setAgencyName(value.name));
        this.props.dispatch(setAgencyDomain(value.domain));
        this.props.dispatch(setAgencyZaloApp(value.zaloApp))
        this.props.dispatch(setPageTitle(value.name));
        this.props.dispatch(setRefCode(value.refCode));
    }
}

const mapStateToProps = (state) => {
    return {
        pageTitle: state.pageTitle,
        agencyName: state.agencyName
    }
};

export default connect(mapStateToProps)(App);
