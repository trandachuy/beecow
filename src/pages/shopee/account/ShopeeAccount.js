import React, {Component} from 'react';
import GSContentContainer from "../../../components/layout/contentContainer/GSContentContainer";
import GSContentHeader from "../../../components/layout/contentHeader/GSContentHeader";
import {ShopeeShopModel} from "../../../components/shared/model";
import PropTypes from "prop-types";
import storage from "../../../services/storage";
import Constants from "../../../config/Constant";
import GSContentBody from "../../../components/layout/contentBody/GSContentBody";
import {UikAvatar, UikWidget} from '../../../@uik';
import './ShopeeAccount.sass';
import {Trans} from "react-i18next";
import shopeeService from "../../../services/ShopeeService";
import ConfirmModalCheckBox from "../../../components/shared/ConfirmModalCheckBox/ConfirmModalCheckBox";
import ConfirmModalChildren from "../../../components/shared/ConfirmModalChildren/ConfirmModalChildren";
import i18next from "../../../config/i18n";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import moment from 'moment';
import {GSToast} from "../../../utils/gs-toast";
import GSButton from "../../../components/shared/GSButton/GSButton";
import {AgencyService} from "../../../services/AgencyService";
import {AvForm,} from "availity-reactstrap-validation";
import GSContentHeaderRightEl
    from '../../../components/layout/contentHeader/ContentHeaderRightEl/GSContentHeaderRightEl';
import _ from 'lodash';
import AvField from 'availity-reactstrap-validation/lib/AvField';
import {RouteUtils} from '../../../utils/route';
import {NAV_PATH} from '../../../components/layout/navigation/Navigation';

class ShopeeAccount extends Component {

    defaultImage = '/assets/images/default_image.png';

    constructor(props) {
        super(props);

        this.state = {
            getStatusInterval: undefined,
            shop: {},
            shopImage: this.defaultImage,

            productImportStatus: '',
            productImportTime: '',
            productImageStatus: '',
            productButtonEnabled: true,
            isNotSynchronizing: true,
            numberDownloaded: 0,

            orderImportStatus: '',
            orderImportTime: '',
            orderImageStatus: '',
            orderButtonEnabled: true,
            orderDownloaded: 0,

            shopAccounts: [],
            shopSelected: {},
            modal: false,
            branches: [],
            branchId: null,
            collectionType: 'MANUAL',
            expiryDate: null,

            orderNumberOfFetch: null
        };

        this.const = {
            PRODUCT_IMAGE_NOTHING: "NOTHING",
            PRODUCT_IMAGE_DOWNLOADING: "SYNCHRONIZING",
            PRODUCT_IMAGE_DOWNLOADED: "DOWNLOADED",
            CONNECT_STATUS_CONNECTED: "CONNECTED",

            ORDER_IMAGE_FETCHED: 'FETCHED',
            ORDER_IMAGE_FETCHING: 'FETCHING',
            ORDER_IMAGE_CHECKING: 'CHECKING',
        };

        // Binding method
        this.changeShopState = this.changeShopState.bind(this);
        this.disconnect = this.disconnect.bind(this);
        this.getProductDownloadInformation = this.getProductDownloadInformation.bind(this);
        this.downloadProduct = this.downloadProduct.bind(this);
        //this.downloadOrder = this.downloadOrder.bind(this);
        //this.getOrderDownloadInformation = this.getOrderDownloadInformation.bind(this);
        this.onChangeShopeeAccount = this.onChangeShopeeAccount.bind(this);
        this.activeOrderPackage = this.activeOrderPackage.bind(this);
        this.fetchOrder = this.fetchOrder.bind(this);
    }

    componentDidMount() {
        this.getAllShopeeAccount();
        this.activeOrderPackage();
        shopeeService.getProductDownloadingOrSynchronizing().then(res => {
            this.setState({
                isNotSynchronizing: !res.isInProgress
            });
        }).catch(e => {
            // do nothing here
        });

        this.checkOrderStatus();
        this.runIntervalGetOrder();
    }

    componentWillUnmount() {
        // clearInterval(this.state.getStatusInterval);
        // clearInterval(this.getOrderStatusInterval);
    }

    getAllShopeeAccount() {
        shopeeService.getAllShopeeAccount()
            .then(response => {
                if(_.isEmpty(response)) {
                    RouteUtils.redirectWithoutReload(this.props, NAV_PATH.shopeeAccountIntro);
                }
                const shopAccount = !_.isEmpty(response) ? {...response[0]} : {};
                this.setState({
                    shopAccounts: response,
                    shopSelected: {value: shopAccount.id, label: shopAccount.shopName},
                    shop: shopAccount
                });
                this.changeShopState(shopAccount);
            })
    }

    changeShopState(shop) {
        if (shop && shop.images && shop.images.length > 1) {
            this.setState({shopImage: shop.images[0].url});
        } else {
            this.setState({shopImage: this.defaultImage});
        }
        this.setState({shop: shop}, () => {
            this.checkOrderStatus();
        });

        this.getProductDownloadInformation(shop);
        this.runIntervalGetProduct(shop);

        this.runIntervalGetOrderAfterChange(shop);

    }

    runIntervalGetProduct(shop) {
        // get order sync status every 10s
        // if (this.state.getStatusInterval) {
        //     clearInterval(this.state.getStatusInterval);
        // }
        //let getStatusInterval = setInterval(() => {
            this.getProductDownloadInformation(shop);
        // }, Constants.SHOPEE_INTERVAL_TIME_VALUE);
        // this.setState({
        //     getStatusInterval: getStatusInterval
        // })
    }

    disconnect() {
        const self = this;
        this.refConfirmModalCheckbox.openModal({
            messages: i18next.t('shopee.account.author.confirm.remove.synced.hint'),
            modalTitle: i18next.t('shopee.account.author.confirm.disconnect.hint'),
            okCallback: (checked) => {
                shopeeService.disconnectShopeeAccount(self.state.shop.shopId, self.state.branchId)
                    .then((response) => {
                        this.changeShopState(response);
                    });
            }
        });
    }

    reconnect() {
        shopeeService.reconnectShopeeAccount(this.state.shop.shopId, this.state.branchId)
            .then((response) => {
                this.changeShopState(response);
            });
    }

    getProductDownloadInformation(shop) {
        shopeeService.getProductDownloadInformation(shop.bcStoreId, shop.shopId)
            .then(response => {
                if (response.isDownLoading) {
                    this.setState({
                        productImportStatus: i18next.t('shopee.account.product.title.status.downloading'),
                        productImageStatus: this.const.PRODUCT_IMAGE_DOWNLOADING,
                        productButtonEnabled: false,
                        numberDownloaded: response.numberOfDownload
                    });
                } else {
                    let {status, timeStatus, buttonEnable, imageStatus, numberDownloaded} = this.extracted(response);
                    this.setState({
                        productImportStatus: status,
                        productImportTime: timeStatus,
                        productImageStatus: imageStatus,
                        productButtonEnabled: buttonEnable && shop.connectStatus === this.const.CONNECT_STATUS_CONNECTED,
                        numberDownloaded: numberDownloaded
                    });
                }
            }).catch(
            e => {
                this.setState({
                    productImportStatus: i18next.t('shopee.account.product.title.status.downloaded'),
                    productImportTime: i18next.t('shopee.account.order.title.downloaded.time') + ' : ' + i18next.t('shopee.account.product.title.synchronized.time.never'),
                    productImageStatus: this.const.PRODUCT_IMAGE_DOWNLOADED,
                    productButtonEnabled: false,
                    numberDownloaded: 0
                });
            }
        );
    }

    extracted(data) {
        let status = '';
        let timeStatus = '';
        let buttonEnable = true;
        let imageStatus = '';
        let numberDownloaded = 0;
        if (data.lastUpdate == null) {
            timeStatus = i18next.t('shopee.account.order.title.downloaded.time') + ' : ' + i18next.t('shopee.account.product.title.synchronized.time.never');
            imageStatus = this.const.PRODUCT_IMAGE_NOTHING;
            status = i18next.t('shopee.account.product.title.status.not_downloaded');
        } else {
            let locale = storage.getFromLocalStorage(Constants.STORAGE_KEY_LANG_KEY);
            timeStatus = i18next.t('shopee.account.order.title.downloaded.time') + ' : ' + moment(data.lastUpdate).locale(locale).fromNow();
            numberDownloaded = data.numberOfDownload;
            if (data.isDownLoading) {
                imageStatus = this.const.PRODUCT_IMAGE_DOWNLOADING;
                status = i18next.t('shopee.account.product.title.status.downloading');
                buttonEnable = false;
            } else {
                imageStatus = this.const.PRODUCT_IMAGE_DOWNLOADED;
                status = i18next.t('shopee.account.product.title.status.downloaded');
            }
        }
        return {status, timeStatus, buttonEnable, imageStatus, numberDownloaded};
    }

    downloadProduct() {
        this.setState({
            productImportStatus: i18next.t('shopee.account.product.title.status.downloading'),
            productImageStatus: this.const.PRODUCT_IMAGE_DOWNLOADING,
            productButtonEnabled: false
        });

        shopeeService.downloadProduct(this.state.shop.bcStoreId, this.state.shop.shopId).then(() => {

        }).catch(e => {
            console.error(e);
            if (e.response.status === 400 &&
                e.response.data &&
                e.response.data.errorKey === 'shop.exceed.thread.downloading') {
                GSToast.error("shopee.account.product.title.status.downloading.exceed", true);
            } else {
                GSToast.commonError();
            }
        });
    }

    activeOrderPackage() {
        shopeeService.getActiveOrderPackageByStoreId()
            .then((result) => {
                this.setState({expiryDate: result.expiredDate});
            })
            .catch((e) => console.error(e));
    }

    onChangeShopeeAccount(e) {
        const id = e.target.value;
        shopeeService.getShopeeAccountById(id)
            .then((shop) => {
                this.changeShopState(shop);
            });
    }

    ///////////////////////////////////////////////////////////////////////
    runIntervalGetOrderAfterChange(shop){
        // if(this.getOrderStatusInterval){
        //     clearInterval(this.getOrderStatusInterval);
        // }

        // get order sync status every 10s
        //this.getOrderStatusInterval = setInterval(() => {
            this.checkOrderStatus();
        //}, Constants.SHOPEE_INTERVAL_TIME_VALUE);
    }

    runIntervalGetOrder(){
        // get order sync status every 10s
        //this.getOrderStatusInterval = setInterval(() => {
            this.checkOrderStatus();
        //}, Constants.SHOPEE_INTERVAL_TIME_VALUE);
    }

    fetchOrder(){

        if(!this.state.shop){
            return;
        }

        shopeeService.getOrderFromShopee(this.state.shop.shopId).then( res =>{
            // set running
            this.setState({
                orderImportStatus : i18next.t('shopee.account.order.title.status.synchronizing'),
                orderImageStatus: this.const.ORDER_IMAGE_FETCHING,
                orderButtonEnabled: false,
                orderNumberOfFetch: null
            });
        }).catch(e =>{
            if(e.response.status === 400){
                // bad request from server => the fetching is already running
                this.setState({
                    orderImportStatus : i18next.t('shopee.account.order.title.status.synchronizing'),
                    orderImageStatus: this.const.ORDER_IMAGE_FETCHING,
                    orderButtonEnabled: false,
                    orderNumberOfFetch: null
                });
            }

            GSToast.commonError();
        });
    }

    checkOrderStatus(){

        if(!this.state.shop || !this.state.shop.shopId){
            this.setState({
                orderImportStatus : i18next.t('shopee.account.order.title.status.synchronized'),
                orderImageStatus: this.const.ORDER_IMAGE_FETCHED,
                orderButtonEnabled: false,
                orderNumberOfFetch: null,
                orderImportTime: i18next.t('shopee.account.order.title.synchronized.time') + ' : ' + i18next.t('shopee.account.order.title.synchronized.time.never')
            });
            return;
        }

        shopeeService.getOrderFetchStatus(this.state.shop.shopId).then(res => {
            let data = res;

            let code = data.code;
            let lastUpdate = data.zoneTime;
            let orderNumberOfFetch = data.numberOfFetch === 0 ? data.numberOfFetch + '' : data.numberOfFetch ? data.numberOfFetch + '' : null;

            if("RUNNING" === code){
                this.setState({
                    orderImportStatus : i18next.t('shopee.account.order.title.status.synchronizing'),
                    orderImageStatus: this.const.ORDER_IMAGE_FETCHING,
                    orderButtonEnabled: false,
                    orderNumberOfFetch: orderNumberOfFetch
                });
            }else{
                this.setState({
                    orderImportStatus : i18next.t('shopee.account.order.title.status.synchronized'),
                    orderImageStatus: this.const.ORDER_IMAGE_FETCHED,
                    orderButtonEnabled: this.state.shop.connectStatus === this.const.CONNECT_STATUS_CONNECTED ,
                    orderNumberOfFetch: orderNumberOfFetch
                });
            }

            if(lastUpdate){
                let locale = storage.getFromLocalStorage(Constants.STORAGE_KEY_LANG_KEY);
                this.setState({
                    orderImportTime: i18next.t('shopee.account.order.title.synchronized.time') + ' : ' + moment(lastUpdate).locale(locale).fromNow()
                });
            }else{
                this.setState({
                    orderImportTime: i18next.t('shopee.account.order.title.synchronized.time') + ' : ' + i18next.t('shopee.account.order.title.synchronized.time.never')
                });
            }

        }).catch(e =>{
            this.setState({
                orderImportStatus : i18next.t('shopee.account.order.title.status.synchronized'),
                orderImageStatus: this.const.ORDER_IMAGE_FETCHED,
                orderButtonEnabled: false,
                orderNumberOfFetch: null,
                orderImportTime: i18next.t('shopee.account.order.title.synchronized.time') + ' : ' + i18next.t('shopee.account.order.title.synchronized.time.never')
            });
        });
    }



    render() {
        const {shop, shopSelected, shopAccounts, shopImage} = this.state;
        return (
            <GSContentContainer className='sp-account'>
                <GSContentHeader className={"shopee-account-header"} title={i18next.t('component.navigation.account')}>
                    <GSContentHeaderRightEl className="d-flex">
                        <AvForm autoComplete="off">
                            <AvField type="select"
                                     name={'row_shopee_selector'}
                                     onChange={this.onChangeShopeeAccount}
                                     defaultValue={shopSelected}>
                                {shopAccounts.map(s => {
                                    return (<option value={s.id}>
                                        {s.shopName}
                                    </option>);
                                })}
                            </AvField>
                        </AvForm>
                    </GSContentHeaderRightEl>
                </GSContentHeader>
                <GSContentBody className='sp-account__body' size={GSContentBody.size.MAX} className='sp-account__body'>
                    <UikWidget className='gs-widget sp-connected'>
                        <div className='sp-connected__content'>
                            <span className='left'>
                                <p className='title'>
                                    <Trans i18nKey="component.navigation.account"/>
                                </p>
                                <p className='description'>
                                    <Trans i18nKey="shopee.account.atuhor.description"/>
                                </p>
                            </span>
                            <span className='right'>
                                <UikAvatar
                                    className="avatar"
                                    imgUrl={shopImage}
                                    size='larger'
                                    margin='true'/>
                                <span className='info'>
                                    <span className='title'>{shop.shopName}</span>
                                    <br/>
                                    <span>
                                        Status: <span
                                        className={`status_${shop.connectStatus}`}>{shop.connectStatus}</span>
                                    </span>
                                </span>

                                <span className='expired-date'>
                                    <span className='title-date'>Expiry date: <span
                                        className='name-date'>{shop.shopType == 'FREE' ? 'N/A' : moment(this.state.expiryDate).format('YYYY-MM-DD')}</span></span>
                                </span>
                            </span>
                        </div>
                        {/* PRODUCT */}
                        <div className='sp-connected__content'>
                            <span className='left'>
                                <p className='title'>
                                    <Trans i18nKey="shopee.account.shopee.product.title"/>
                                </p>
                                <p className='description'>
                                    <Trans i18nKey="shopee.account.shopee.product.description" values={{
                                        provider: AgencyService.getDashboardName()
                                    }}/>
                                </p>
                            </span>
                            <span className='right'>
                                {
                                    this.state.productImageStatus === this.const.PRODUCT_IMAGE_NOTHING &&
                                    <FontAwesomeIcon className="avatar image-status__grey" icon="sync-alt"/>
                                }
                                {
                                    this.state.productImageStatus === this.const.PRODUCT_IMAGE_DOWNLOADING &&
                                    <FontAwesomeIcon className="avatar image-status__grey image-rotate"
                                                     icon="sync-alt"/>
                                }
                                {
                                    this.state.productImageStatus === this.const.PRODUCT_IMAGE_DOWNLOADED &&
                                    <FontAwesomeIcon className="avatar image-status__green" icon="check-circle"/>
                                }
                                <span className='info'>
                                    <span className='synch-title'>
                                        {this.state.productImportStatus}
                                        {
                                            <span>
                                                {'  (' + this.state.numberDownloaded + ')'}
                                            </span>
                                        }
                                    </span>
                                    <br/>
                                    <span className='synch-status'>
                                        {this.state.productImportTime}
                                    </span>
                                </span>
                                <GSButton
                                    success
                                    className={'btn-disconnect ' + (this.state.productButtonEnabled && this.state.isNotSynchronizing ? '' : 'gs-atm--disable')}
                                    onClick={this.downloadProduct}
                                >
                                    {i18next.t("shopee.account.product.button.title.downloadShopeeProduct")}
                                </GSButton>
                            </span>
                        </div>
                        {/* ORDERS */}
                        <div className='sp-connected__content'>
                            <span className='left'>
                                <p className='title'>
                                    <Trans i18nKey="shopee.account.shopee.order.title"/>
                                </p>
                                <p className='description'>
                                    <Trans i18nKey="shopee.account.shopee.order.description" values={{
                                        provider: AgencyService.getDashboardName()
                                    }}/>
                                </p>
                            </span>
                            <span className='right'>
                                {
                                    this.state.orderImageStatus == this.const.ORDER_IMAGE_FETCHING &&
                                    <FontAwesomeIcon className="avatar image-status__grey image-rotate" icon="sync-alt"/>
                                }
                                {
                                    this.state.orderImageStatus == this.const.ORDER_IMAGE_FETCHED &&
                                    <FontAwesomeIcon className="avatar image-status__green" icon="check-circle"/>
                                }
                                <span className='info'>
                                    <span className='synch-title'>
                                        {this.state.orderImportStatus}
                                        {
                                            this.state.orderNumberOfFetch &&
                                            <span>
                                                {'  (' + this.state.orderNumberOfFetch + ')'}
                                            </span>
                                        }
                                    </span>
                                    <br/>
                                    <span className='synch-status'>
                                        {this.state.orderImportTime}
                                    </span>
                                </span>
                                <GSButton
                                    success
                                    className={'btn-disconnect ' + (this.state.orderButtonEnabled === false ? 'gs-atm--disable' : '')}
                                    onClick={this.fetchOrder}
                                >
                                    {i18next.t("shopee.account.product.button.title.synchronize")}
                                </GSButton>
                            </span>
                        </div>
                        <div className='sp-connected__content'>
                            <span className='left'>
                                <p className='title'>
                                    <Trans i18nKey="shopee.terms.conditions"/>
                                </p>
                                <p className='description'>
                                    <Trans i18nKey="shopee.terms.conditions.transaction"/>
                                </p>
                            </span>
                            <span className='right' style={{
                                paddingLeft: '1%'
                            }}>
                                <a href='https://shopee.vn/legaldoc/policies/' target='_blank'
                                   className="gsa-text--non-underline">
                                    <GSButton success outline>
                                        <Trans i18nKey="shopee.terms.conditions.url"/>
                                    </GSButton>
                                </a>
                            </span>
                        </div>
                    </UikWidget>
                </GSContentBody>
                <ConfirmModalCheckBox ref={(el) => {
                    this.refConfirmModalCheckbox = el;
                }}/>
                <ConfirmModalChildren
                    ref={(el) => {
                        this.refConfirmModalChildren = el;
                    }}
                    btnOkName={i18next.t('common.btn.yes')}
                    btnCancelName={i18next.t('common.btn.no')}
                >
                    {i18next.t('shopee.account.product.warning')}
                </ConfirmModalChildren>
            </GSContentContainer>
        );
    }
}

ShopeeAccount.propTypes = {
    shop: PropTypes.instanceOf(ShopeeShopModel)
};

export default ShopeeAccount;
