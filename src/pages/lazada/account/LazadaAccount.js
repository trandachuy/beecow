import React, {Component, createRef, useEffect, useState} from 'react';
import {lazadaService} from "../../../services/LazadaService";
import {UikButton, UikRadio} from '../../../@uik';
import Constants from "../../../config/Constant";
import './LazadaAccount.sass';
import {SellerInfoModel} from '../../../components/shared/model';
import ConfirmModalCheckBox from "../../../components/shared/ConfirmModalCheckBox/ConfirmModalCheckBox";
import {Trans} from "react-i18next";
import i18next from "../../../config/i18n";
import {connect} from "react-redux";
import GSLearnMoreFooter from "../../../components/shared/GSLearnMoreFooter/GSLearnMoreFooter";
import GSContentFooter from "../../../components/layout/GSContentFooter/GSContentFooter";
import GSContentContainer from "../../../components/layout/contentContainer/GSContentContainer";
import GSContentBody from "../../../components/layout/contentBody/GSContentBody";
import {CredentialUtils} from "../../../utils/credential";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import moment from 'moment';
import storage from "../../../services/storage";
import ConfirmModalChildren from "../../../components/shared/ConfirmModalChildren/ConfirmModalChildren";
import GSButton from "../../../components/shared/GSButton/GSButton";
import {AgencyService} from "../../../services/AgencyService";
import { GSToast } from '../../../utils/gs-toast';
import ConfirmModal from '../../../components/shared/ConfirmModal/ConfirmModal';
import GSTrans from '../../../components/shared/GSTrans/GSTrans';
import PropTypes from "prop-types";
import Modal from "reactstrap/es/Modal";
import ModalBody from "reactstrap/es/ModalBody";
import ModalFooter from "reactstrap/es/ModalFooter";
import ModalHeader from "reactstrap/es/ModalHeader";
import {RouteUtils} from "../../../utils/route";
import {NAV_PATH} from "../../../components/layout/navigation/Navigation";

const client_id= process.env.LAZADA_CLIENT_ID;

const PRODUCT_SYNC_OPTION = {
    NEW: 'NEW',
    OVERRIDE: 'OVERRIDE'
}

class LazadaAccount extends Component {
    constructor(props) {
        super(props);
        this.refConfirmModal = createRef();
        this.state = {
            selectedColor: this.props.value,
            lzToken: CredentialUtils.getLazadaToken(),
            countryUserInfo: [],
            sellerInfo: new SellerInfoModel,
            sellerId: CredentialUtils.getLazadaStoreId(),
            currentSellerId: '',
            storeId: CredentialUtils.getStoreId(),

            productImportStatus: i18next.t('common.message.loading'),
            productImportTime: i18next.t('common.message.loading'),
            productImageStatus : 'NOTHING',
            productButtonEnabled : false,
            productOverwrite: false,
            numberOfFetch: null,
            numberOfSync: null,
            
            orderImportStatus: i18next.t('lazada.account.order.title.status.synchronized'),
            orderImportTime: i18next.t('common.message.loading'),
            orderImageStatus: 'FETCHED',
            orderButtonEnable: false,
            orderNumberOfFetch: null,

            isShowSyncProductModal: false
        }
        // this.props.dispatch(setPageTitle(process.env.APP_NAME + ' - Lazada Account'));
        this.authorization = this.authorization.bind(this);
        this.disbleAuthenComponent = this.disbleAuthenComponent.bind(this);
        this.getCountryUserInfo = this.getCountryUserInfo.bind(this);
        this.getSellerInfo = this.getSellerInfo.bind(this);
        this.sellerActived = this.sellerActived.bind(this);
        this.activatedSeller = this.activatedSeller.bind(this);
        this.checkAuthorization();
        this.fetchOrder = this.fetchOrder.bind(this);
        this.getProductStatus = this.getProductStatus.bind(this);
        this.runIntervalGetProduct = this.runIntervalGetProduct.bind(this);
        this.runFetchWarning = this.runFetchWarning.bind(this);
        this.fetchOrSynch = this.fetchOrSynch.bind(this);
        this.confirmReconnectAccount = this.confirmReconnectAccount.bind(this);
        this.disconnectLazada = this.disconnectLazada.bind(this);
        this.onCancelSyncProduct = this.onCancelSyncProduct.bind(this);
        this.onOkSyncProduct = this.onOkSyncProduct.bind(this);

        this.const = {
            PRODUCT_IMAGE_NOTHING: "NOTHING",
            PRODUCT_IMAGE_SYNCHRONIZING: "SYNCHRONIZING",
            PRODUCT_IMAGE_SYNCHRONIZED: "SYNCHRONIZIED",
            PRODUCT_IMAGE_SYNCHRONIZE_ERROR: "SYNCHRONIZE_ERROR",

            ORDER_IMAGE_FETCHED: 'FETCHED',
            ORDER_IMAGE_FETCHING: 'FETCHING'
        };
    }

    componentWillUnmount() {
        this._isMounted = false;
        clearInterval(this.getStatusInterval);
    }

    checkAuthorization(){
        this.props.setLoading();
        if(!this.props.location.search.indexOf('?code')){
            lazadaService.authorization({ 
                'code': window.document.URL.split('=')[1],
                'bcStoreId' : this.state.storeId
            }).then(res => {
                this.disbleAuthenComponent(res);
                this.init();
                this.props.cancelLoading();
            }, error => {
                this.props.cancelLoading();
                this.refConfirmModal.openModal({
                    messages: error.response.data.message,
                    modalTitle: i18next.t("page.notification.intro.title"),
                    showButtonCancel: false,
                    okCallback: () => {
                        RouteUtils.redirectTo(NAV_PATH.lazada);
                    }
                })
            });
        }else{
            this.init();
            this.props.cancelLoading();
        }
    }
    disbleAuthenComponent = (res) => {
        this.setState({ lzToken: res });
    }

    componentDidMount(){
        if(this.state.storeId && this.state.lzToken){
            lazadaService.getAccountByBcStoreId(this.state.storeId).then(res =>{
                let locale = storage.getFromLocalStorage(Constants.STORAGE_KEY_LANG_KEY);
                let orderImportTime = i18next.t('shopee.account.product.title.synchronized.time') + ' : ' + moment(res.lastFetchOrderDate).locale(locale).fromNow();
                this.setState({
                    orderImportTime: orderImportTime
                });
            })

            // run fetch status
            this.getProductStatus();
            this.runIntervalGetProduct();
        }
    }

    init = () => {
        let self = this;
        if(this.state.storeId && !this.state.lzToken){
            lazadaService.getAccountByBcStoreId(this.state.storeId).then(res =>{
                let locale = storage.getFromLocalStorage(Constants.STORAGE_KEY_LANG_KEY);
                let timeStatus = i18next.t('shopee.account.product.title.synchronized.time') + ' : ' + moment(res.lastFetchOrderDate).locale(locale).fromNow();
                this.setState({
                    orderImportTime: timeStatus
                });

                // run fetch status
                this.getProductStatus();
                this.runIntervalGetProduct();

                self.disbleAuthenComponent(res.accessToken);
                self.loadUserInfo();
                self.setState({sellerId: res.sellerId});
            })
        }else{
            self.loadUserInfo();
        }
    }
    loadUserInfo(){
        this.getCountryUserInfo();
        this.getSellerInfo();
    }
    getCountryUserInfo = () => {
        let self = this;
        lazadaService.getCountryUserInfo({ 'accessToken': self.state.lzToken }).then(res => {
            self.setState({ countryUserInfo: res });
        }, error => {
            self.setState({
                lzToken: undefined,
                sellerId: undefined
            })
        })
    }
    getSellerInfo = () => {
        let self = this;
        lazadaService.getSellerInfo({ 'accessToken': self.state.lzToken }).then((res) => {
            self.setState({ sellerInfo: res });
        }, error => {
            self.setState({
                lzToken: undefined,
                sellerId: undefined
            })
            const message = error.response.data? error.response.data.message:"";
            this.confirmReconnectAccount(message);
        })
        .catch((xhr) => {
            const message = xhr.response.data? xhr.response.data.message:"";
            this.confirmReconnectAccount(message);
        })
    }

    popupCenterDual(url, title, w, h) {
        const dualScreenLeft = window.screenLeft != undefined ? window.screenLeft : screen.left;
        const dualScreenTop = window.screenTop != undefined ? window.screenTop : screen.top;
        const width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
        const height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;

        const left = ((width / 2) - (w / 2)) + dualScreenLeft;
        const top = ((height / 2) - (h / 2)) + dualScreenTop;
        const newWindow = window.open(url, title, 'scrollbars=yes, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);

        // Puts focus on the newWindow
        if (window.focus) {
            newWindow.focus();
        }
        return newWindow;
    }

    authorization() {
        let self = this;
        window.location.href = `https://auth.lazada.com/oauth/authorize?response_type=code&force_auth=true&client_id=${client_id}`;
    }

    activatedSeller($event) {
        const sellerId = $event.currentTarget.id;
        if (sellerId === this.state.currentSellerId)
            this.setState({ currentSellerId: undefined });
        else
            this.setState({ currentSellerId: sellerId });
    };

    sellerActived() {
        let self = this;
        this.setState({ sellerId: this.state.currentSellerId });
        localStorage.setItem(Constants.STORAGE_KEY_LAZADA_ID, this.state.currentSellerId);
        lazadaService.connectSeller({ 'accessToken': this.state.lzToken, 'sellerId': this.state.currentSellerId }).then((res) =>{
            //self.fetchProduct();

            // run fetch status
            this.getProductStatus();
            this.runIntervalGetProduct();

            self.fetchOrder();
        });
    }

    fetchOrder(){
        // set running
        this.setState({
            orderImportStatus : i18next.t('lazada.account.order.title.status.synchronizing'),
            orderImageStatus: this.const.ORDER_IMAGE_FETCHING,
            orderButtonEnabled: false,
            orderNumberOfFetch: null
        });

        lazadaService.fetchOrders(this.state.storeId).then(res =>{
            let locale = storage.getFromLocalStorage(Constants.STORAGE_KEY_LANG_KEY);
            let timeStatus = i18next.t('shopee.account.product.title.synchronized.time') + ' : ' + moment(res.lastFetchDate).locale(locale).fromNow();
            
            this.setState({
                orderImportStatus : i18next.t('lazada.account.order.title.status.synchronized'),
                orderImageStatus: this.const.ORDER_IMAGE_FETCHED,
                orderButtonEnabled: true,
                orderNumberOfFetch: res.totalUpdateOrders === 0 ? res.totalUpdateOrders + '' : res.totalUpdateOrders ? res.totalUpdateOrders + '' : null,
                orderImportTime: timeStatus
                
            });
        }).catch(e =>{
            this.setState({
                orderImportStatus : i18next.t('lazada.account.order.title.status.synchronized'),
                orderImageStatus: this.const.ORDER_IMAGE_FETCHED,
                orderButtonEnabled: true,
                orderNumberOfFetch: null
            });
        });
    }

    fetchProduct(){
        lazadaService.fetchProducts({ 'accessToken': this.state.lzToken, 'limit': 100, "filter": "all" }).then( res => {
        })
    }

    getProductStatus(){
        //let getStatusInterval = setInterval(() => {
            lazadaService.getProductFetchStatus()
                .then(response =>{
                    let data = response;

                    let productStatusCode = '';
                    let neverCode = '';
                    let buttonEnable = true;
                    let imageStatus = '';
                    let lastSyncTime;
                    let numberOfFetch;
                    let numberOfSync;

                    if(!data){
                        neverCode = 'lazada.account.product.title.synchronized.time.never';
                        productStatusCode = 'lazada.account.product.title.status.not_synced';
                        imageStatus = this.const.PRODUCT_IMAGE_NOTHING;

                    }else{

                        lastSyncTime = data.zoneTime;
                        let code = data.code;
                        let error = data.error;
                        numberOfFetch = data.numberOfFetch === 0 ? data.numberOfFetch + '' : data.numberOfFetch ? data.numberOfFetch + '' : null;
                        numberOfSync = data.numberOfSync === 0 ? data.numberOfSync + '' : data.numberOfSync ? data.numberOfSync + '' : null;

                        // no sync before
                        if(!lastSyncTime){
                            neverCode = 'lazada.account.product.title.synchronized.time.never';
                        }
            
                        if(code == 'SYNCHRONIZING'){
                            productStatusCode = 'lazada.account.product.title.status.synchronizing';
                            buttonEnable = false;
                            imageStatus = this.const.PRODUCT_IMAGE_SYNCHRONIZING;

                        }else{
                            if(error){
                                //productStatusCode = 'shopee.account.product.title.status.synchronize.error';
                                //imageStatus = this.const.PRODUCT_IMAGE_SYNCHRONIZE_ERROR;
                                productStatusCode = 'lazada.account.product.title.status.synchronized';
                                imageStatus = this.const.PRODUCT_IMAGE_SYNCHRONIZED;

                            }else{
                                if(lastSyncTime){
                                    productStatusCode = 'lazada.account.product.title.status.synchronized';
                                    imageStatus = this.const.PRODUCT_IMAGE_SYNCHRONIZED;

                                }else{
                                    productStatusCode = 'lazada.account.product.title.status.not_synced';
                                    imageStatus = this.const.PRODUCT_IMAGE_NOTHING;
                                }
                                
                            }
                        }
                    }

                    // status
                    let productStatus = i18next.t(productStatusCode);

                    // time
                    let timeStatus = '';
                    if(!lastSyncTime){
                        timeStatus = i18next.t('lazada.account.product.title.synchronized.time') + ' : ' + i18next.t(neverCode);
                    } else {
                        let locale = storage.getFromLocalStorage(Constants.STORAGE_KEY_LANG_KEY);
                        timeStatus = i18next.t('lazada.account.product.title.synchronized.time') + ' : ' + moment(lastSyncTime).locale(locale).fromNow();
                    }

                    this.setState({
                        productImportStatus : productStatus,
                        productImportTime : timeStatus,
                        productImageStatus: imageStatus,
                        productButtonEnabled: buttonEnable,
                        numberOfFetch: numberOfFetch,
                        numberOfSync: numberOfSync
                    });
                }).catch(
                    e => console.error(e)
                );
        //}, 10000);
    }

    runIntervalGetProduct(){
        // get product sync status every 10s
        this.getStatusInterval = setInterval(() => {
            this.getProductStatus();
        }, 10000);
    }

    runFetchWarning(){
        this.setState({
            isShowSyncProductModal: true
        })
    }

    onOkSyncProduct(syncOption) {
        switch (syncOption) {
            case PRODUCT_SYNC_OPTION.NEW:
                this.fetchOrSynch(false);
                break;
            case PRODUCT_SYNC_OPTION.OVERRIDE:
                this.fetchOrSynch(true);
                break;
        }
        this.setState({
            isShowSyncProductModal: false
        })
    }

    onCancelSyncProduct() {
        this.setState({
            isShowSyncProductModal: false
        })
    }

    fetchOrSynch(overwrite){
        this.setState({
            productImportStatus : i18next.t('shopee.account.product.title.status.synchronizing'),
            productImageStatus: this.const.PRODUCT_IMAGE_SYNCHRONIZING,
            productButtonEnabled: false,
            numberOfFetch: null,
            numberOfSync: null
        });

        lazadaService.fetchAndSyncToBC(overwrite, this.state.lzToken).then(response => {
            // do nothing here, waiting for next check status
        }).catch(e => {
            console.error(e);
            GSToast.commonError();
        });
    }

    disconnect() {
        const self = this;
        const lzService = lazadaService;
        const constants = Constants;
        this.refConfirmModalCheckbox.openModal({
            messages: i18next.t('lazada.account.author.confirm.remove.synced.hint'),
            modalTitle: i18next.t('lazada.account.author.confirm.disconnect.hint'),
            okCallback: (checked) => {
                lzService.deactivatedAccount({ 'accessToken': self.state.lzToken });
                localStorage.removeItem(constants.STORAGE_KEY_LAZADA_ID);
                localStorage.removeItem(constants.STORAGE_KEY_LAZADA_TOKEN);
                self.setState({
                    lzToken: null,
                    sellerId: null,
                    currentSellerId: null
                });
                clearInterval(self.getStatusInterval);
            }
        })
    }
    
    disconnectLazada() {
        const self = this;
        lazadaService.disconnectLazada();
        localStorage.removeItem(Constants.STORAGE_KEY_LAZADA_ID);
        localStorage.removeItem(Constants.STORAGE_KEY_LAZADA_TOKEN);
        self.setState({
            lzToken: null,
            sellerId: null,
            currentSellerId: null
        });
        clearInterval(self.getStatusInterval);
    }

    confirmReconnectAccount(message) {
        let tokenProblem = /token|invalid|expired/i.test(message);
        if(tokenProblem) {  
            this.refConfirmModal.openModal({
                modalTitle: i18next.t('lazada.alert.modal.title'),
                modalBtnOk: i18next.t('lazada.alert.modal.reconnect'),
                messages: <div><GSTrans t={'lazada.alert.modal.message'} /></div>,
                messageHtml: true,
                cancelCallback: () => {
                    this.disconnectLazada();
                },
                okCallback: () => {
                    this.disconnectLazada();
                    this.authorization();
                }
            })
        }
    }

    render() {
        let userInfo = this.state.countryUserInfo.find(item => item.seller_id === this.state.sellerInfo.sellerId + "");
        if (!this.state.lzToken) {
            return (
                <>
                    <GSContentContainer className="gs-atm__flex-col--flex-center">
                        <GSContentBody size={GSContentBody.size.MAX} className="lz-body">
                            <section className={!this.state.lzToken ? 'lz-container' : 'disabled'}>
                                <div className="lz-authen">
                                    <h3>
                                        <Trans i18nKey="lazada.account.author.title"/>
                                    </h3>
                                    <span className="lz-activated-title">
                                        <Trans i18nKey="lazada.account.author.notconnect"/>
                                    </span>
                                    <GSButton success className="btn-save btn-enable" onClick={() => this.authorization()}>
                                        {/* i18nKey="common.btn.createProduct" */}
                                        <Trans className="sr-only" i18nKey="lazada.account.author.connect">
                                        </Trans>
                                    </GSButton>
                                </div>
                                <div className="logo-author">
                                    <img src="/assets/images/group-3@3x.png" />
                                </div>
                            </section>

                        </GSContentBody>

                        <GSContentFooter>
                            <GSLearnMoreFooter
                                text={i18next.t("lazada.account.author.title")}
                                linkTo={Constants.UrlRefs.LEARN_MORE_AUTHENTICATE_LAZADA}/>
                        </GSContentFooter>
                    </GSContentContainer>
                    <ConfirmModal ref={(el) => this.refConfirmModal = el}/>
                </>
            );
        } else {
            if (this.state.sellerId) {
                return (
                    <>
                        <ModalConfirmSyncProduct open={this.state.isShowSyncProductModal}
                                                 onCancel={this.onCancelSyncProduct}
                                                 onOk={this.onOkSyncProduct}
                        />
                        <section className="seller">
                            <div className="header">
                                <span className="breadcrumb">
                                    <p>Lazada </p><p> /</p><p><Trans className="sr-only" i18nKey="component.navigation.account">
                                        </Trans></p>
                                </span>
                            </div>
                            {/* ACCOUNT */}
                            <div className="content seller-activated">
                                <div className="seller-account">
                                    <span className="term">
                                        <p><Trans className="sr-only" i18nKey="component.navigation.account"></Trans></p>
                                        <p><Trans className="sr-only" i18nKey="lazada.account.atuhor.description"></Trans></p>
                                    </span>
                                    <div className="detail">
                                        <div className="logo-wrapper gsa-flex-grow--1">
                                            <img className="logo-url" src={this.state.sellerInfo.logoUrl} />
                                        </div>
                                        <span className="shop-name gsa-flex--5">
                                            <p>{this.state.sellerInfo.name}</p>
                                            <p>{this.state.sellerInfo.email}</p>
                                        </span>
                                        <GSButton success className="btn-save btn-enable gsa-flex--2" onClick={() => {this.disconnect()}}>
                                            <Trans className="sr-only" i18nKey="lazada.account.author.disconnect"></Trans>
                                        </GSButton>
                                    </div>
                                </div>
                                {/* PRODUCT */}
                                <div className="seller-account">
                                    <span className="term">
                                        <p><Trans className="sr-only" i18nKey="lazada.account.shopee.product.title"></Trans></p>
                                        <p><Trans className="sr-only" i18nKey="lazada.account.shopee.product.description" values={{
                                            provider: AgencyService.getDashboardName()
                                        }}></Trans></p>
                                    </span>
                                    <div className="detail">
                                        <div className="gsa-flex--1">
                                        {
                                        this.state.productImageStatus == this.const.PRODUCT_IMAGE_SYNCHRONIZE_ERROR &&
                                        <FontAwesomeIcon className="avatar image-status__red" icon="sync-alt"/>
                                        }
                                        {
                                            this.state.productImageStatus == this.const.PRODUCT_IMAGE_NOTHING &&
                                            <FontAwesomeIcon className="avatar image-status__grey" icon="sync-alt"/>
                                        }
                                        {
                                            this.state.productImageStatus == this.const.PRODUCT_IMAGE_SYNCHRONIZING &&
                                            <FontAwesomeIcon className="avatar image-status__grey image-rotate" icon="sync-alt"/>
                                        }
                                        {
                                            this.state.productImageStatus == this.const.PRODUCT_IMAGE_SYNCHRONIZED &&
                                            <FontAwesomeIcon className="avatar image-status__green" icon="check-circle"/>
                                        }
                                        </div>
                                        <span className="shop-name gsa-flex--5">
                                            <p>
                                                {this.state.productImportStatus}
                                                {
                                                    this.state.numberOfFetch && this.state.numberOfSync &&
                                                    <span>
                                                        {'  (' + this.state.numberOfSync + '/' + this.state.numberOfFetch + ')'}
                                                    </span>
                                                }
                                            </p>
                                            <p>
                                                {this.state.productImportTime}
                                            </p>
                                        </span>
                                        <GSButton success className={"btn-save btn-enable gsa-flex--2 " + (this.state.productButtonEnabled == false ? 'gs-atm--disable' : '')} onClick={this.runFetchWarning}>
                                            <Trans className="sr-only" i18nKey="lazada.account.product.button.title.synchronize"></Trans>
                                        </GSButton>
                                    </div>
                                </div>
                                {/* ORDERS */}
                                <div className="seller-account">
                                    <span className="term">
                                        <p><Trans className="sr-only" i18nKey="lazada.account.lazada.order.title"></Trans></p>
                                        <p><Trans className="sr-only" i18nKey="lazada.account.lazada.order.description" values={{
                                            provider: AgencyService.getDashboardName()
                                        }}></Trans></p>
                                    </span>
                                    <div className="detail">
                                        <div className="gsa-flex--1">
                                        {
                                            this.state.orderImageStatus == this.const.ORDER_IMAGE_FETCHING &&
                                            <FontAwesomeIcon className="avatar image-status__grey image-rotate" icon="sync-alt"/>
                                        }
                                        {
                                            this.state.orderImageStatus == this.const.ORDER_IMAGE_FETCHED &&
                                            <FontAwesomeIcon className="avatar image-status__green" icon="check-circle"/>
                                        }
                                        </div>
                                        <span className="shop-name gsa-flex--5">
                                            <p>
                                                {this.state.orderImportStatus}
                                                {
                                                    this.state.orderNumberOfFetch &&
                                                    <span>
                                                        {'  (' + this.state.orderNumberOfFetch + ')'}
                                                    </span>
                                                }
                                            </p>
                                            <p>
                                                {this.state.orderImportTime}
                                            </p>
                                        </span>
                                        <GSButton success className={"btn-save btn-enable gsa-flex--2 " + (this.state.orderButtonEnabled == false ? 'gs-atm--disable' : '')} onClick={this.fetchOrder}>
                                            <Trans className="sr-only" i18nKey="shopee.account.product.button.title.synchronize"></Trans>
                                        </GSButton>
                                    </div>
                                </div>
                                {/* TERM AND CONDITION */}
                                <div className="seller-account">
                                    <span className="term">
                                        <p><Trans className="sr-only" i18nKey="lazada.terms.conditions"></Trans></p>
                                        <p><Trans className="sr-only" i18nKey="lazada.terms.conditions.transaction"></Trans></p>
                                    </span>
                                    <div className="detail" style={{padding: '15px'}}>
                                    <a href="https://www.lazada.vn/terms-of-use" target='_blank'>
                                        <GSButton success outline>
                                            Lazada's <Trans className="sr-only" i18nKey="lazada.terms.conditions"></Trans>
                                        </GSButton>
                                    </a>
                                    </div>
                                </div>
                            </div>
                            <ConfirmModalCheckBox ref={(el) => { this.refConfirmModalCheckbox = el }} />
                            <ConfirmModalChildren
                                ref={(el) => { this.refConfirmModalChildren = el }}
                                btnOkName={i18next.t('common.btn.yes')}
                                btnCancelName={i18next.t('common.btn.no')}
                            >
                                {i18next.t('lazada.account.product.warning')}
                                <div className={"common-note mt-1 font-size-_9rem"}>
                                    {i18next.t('common.txt.notice')}: {i18next.t('product.update.notice.incomplete.transfer')}
                                </div>
                            </ConfirmModalChildren>
                        </section>
                    </>
                )
            } else {
                return (
                    /* Stores info  */
                    <section className={this.state.lzToken ? 'stores' : 'disabled'}>
                        <div className="header">
                            <span className="breadcrumb">
                                <p>Lazada </p><p> /</p><p><Trans className="sr-only" i18nKey="component.navigation.account">
                                    </Trans></p>
                            </span>
                            <UikButton success
                            className={this.state.currentSellerId ? "btn-save btn-enable": "btn-save btn-enable disable-event"}
                            onClick={() => { this.sellerActived() }}>
                                {/* i18nKey="common.btn.createProduct" */}
                                <Trans className="sr-only">
                                    Ok
                                    </Trans>
                            </UikButton>
                        </div>
                        <div className="content country">
                            <h5><Trans className="sr-only" i18nKey="lazada.account.author.store.select"></Trans></h5>
                            <div className={this.state.sellerInfo.sellerId + "" === this.state.currentSellerId ? 'seller-info active' : 'seller-info'}
                                id={this.state.sellerInfo.sellerId}
                                onClick={($event) => { this.activatedSeller($event) }}>
                                <div className="circle-check" >
                                </div>
                                <img className="logo-url" src={this.state.sellerInfo.logoUrl} />
                                <span className="shop-name">
                                    <p>{this.state.sellerInfo.name}</p>
                                    <p>{userInfo ? userInfo.country : ""}</p>
                                </span>
                            </div>
                        </div>
                    </section>
                )
            }

        }

    }
}

const ModalConfirmSyncProduct = (props) => {
    const [stSyncOption, setStSyncOption] = useState(PRODUCT_SYNC_OPTION.NEW);

    const onChangeOption = (option) => {
        setStSyncOption(option)
    }

    useEffect(() => {
        setStSyncOption(PRODUCT_SYNC_OPTION.NEW)
    }, [props.open]);

    return (
        <Modal isOpen={props.open}>
            <ModalHeader className="modal-success">
                <GSTrans t="shopee.account.author.modal.title"/>
            </ModalHeader>
            <ModalBody>
                <div className="text-center mb-4">
                    <span>
                        <GSTrans t="page.lazada.account.syncProductHint"/>
                    </span>
                </div>
                <div className="text-left font-size-1rem">
                    <UikRadio
                        label={
                            <span className="font-size-1rem">
                                <GSTrans t="page.lazada.account.syncProductOption.new"/>
                            </span>
                        }
                        name="sync-option"
                        checked={stSyncOption === PRODUCT_SYNC_OPTION.NEW}
                        onClick={() => onChangeOption(PRODUCT_SYNC_OPTION.NEW)}
                    />
                    <UikRadio
                        label={
                            <span className="color-red font-size-1rem">
                                <GSTrans t="page.lazada.account.syncProductOption.override"/>
                            </span>
                        }
                        name="sync-option"
                        checked={stSyncOption === PRODUCT_SYNC_OPTION.OVERRIDE}
                        onClick={() => onChangeOption(PRODUCT_SYNC_OPTION.OVERRIDE)}
                    />
                </div>
                <div className="color-gray mt-4">
                    <em>
                        <GSTrans t="page.lazada.account.syncProduct.note">
                            <strong>Notice: </strong>GoSELL product in an incomplete transfer will not be updated
                        </GSTrans>
                    </em>
                </div>
            </ModalBody>
            <ModalFooter>
                <GSButton secondary outline marginRight onClick={props.onCancel}>
                    <GSTrans t="common.btn.cancel"/>
                </GSButton>
                <GSButton success onClick={() => props.onOk(stSyncOption)}>
                    <GSTrans t="common.btn.ok"/>
                </GSButton>
            </ModalFooter>
        </Modal>
    )
}

ModalConfirmSyncProduct.propTypes = {
    open: PropTypes.bool,
    onOk: PropTypes.func,
    onCancel: PropTypes.func,
}

export default connect()(LazadaAccount);
