import React, {Component} from 'react';
import GSContentContainer from "../../../components/layout/contentContainer/GSContentContainer";
import GSContentHeader from "../../../components/layout/contentHeader/GSContentHeader";
import ContentBreakcrum, {Breakcrum} from "../../../components/layout/contentBreakcrum/ContentBreakcrum";
import {ShopeeShopModel} from "../../../components/shared/model";
import PropTypes from "prop-types";
import GSContentBody from "../../../components/layout/contentBody/GSContentBody";
import {UikAvatar, UikWidget} from '../../../@uik';
import './BeecowAccount.sass';
import {Trans} from "react-i18next";
import ConfirmModalCheckBox from "../../../components/shared/ConfirmModalCheckBox/ConfirmModalCheckBox";
import ConfirmModalChildren from "../../../components/shared/ConfirmModalChildren/ConfirmModalChildren";
import i18next from "../../../config/i18n";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import GSButton from "../../../components/shared/GSButton/GSButton";
import {CredentialUtils} from "../../../utils/credential";
import GSTrans from "../../../components/shared/GSTrans/GSTrans";
import {AgencyService} from "../../../services/AgencyService";

class BeecowAccount extends Component {

    _isMounted = false;
    breakcrums = [];
    defaultImage = '/assets/images/default_image.png';

    constructor(props) {
        super(props);

        // Binding method
        this.initBreakcrums = this.initBreakcrums.bind(this);


        // Init breakcrums
        this.initBreakcrums();
    }

    componentDidMount() {
        this._isMounted = true;

        // this.getProductStatus();
        // this.runIntervalGetProduct();
        //
        // this.checkOrderStatus();
        // this.runIntervalGetOrder();
    }

    componentWillUnmount() {
        this._isMounted = false;
        clearInterval(this.getStatusInterval);
        clearInterval(this.getOrderStatusInterval);
    }

    initBreakcrums() {
        this.breakcrums.push(new Breakcrum('component.button.selector.saleChannel.beecow', '/channel/beecow/account'));
        this.breakcrums.push(new Breakcrum('component.navigation.account', '/channel/beecow/account'));
    }



    render() {
        return this.renderConnectedState();
    }

    renderConnectedState() {
        return (
            <GSContentContainer className='sp-account'>
                <GSContentHeader children={<ContentBreakcrum breakcrumList={this.breakcrums}/>}/>
                <GSContentBody className='sp-account__body' size={GSContentBody.size.MAX} className='sp-account__body'>
                    <UikWidget className='gs-widget sp-connected'>
                        <div className='sp-connected__content'>
                            <span className='left'>
                                <p className='title'>
                                    <Trans i18nKey="component.navigation.account"/>
                                </p>
                                <p className='description'>
                                   <GSTrans t={"page.saleChannel.account.author.description"} values={{saleChannel: 'GoMua'}}/>
                                </p>
                            </span>
                            <span className='right'>
                                <UikAvatar
                                    className="avatar"
                                    imgUrl={CredentialUtils.getStoreImage()}
                                    size='larger'
                                    margin = 'true' />
                                <span className='info'>
                                    <span className='title'>{CredentialUtils.getStoreName()}</span>
                                    <br/>
                                </span>
                            </span>
                        </div>
                        {/* PRODUCT */}
                        <div className='sp-connected__content'>
                            <span className='left'>
                                <p className='title'>
                                    <GSTrans t={"page.saleChannel.account.product.title"} values={{saleChannel: 'GoMua'}}/>
                                </p>
                                <p className='description'>
                                    <GSTrans t={"page.saleChannel.account.product.description"} values={{saleChannel: 'GoMua', provider: AgencyService.getDashboardName()}}/>
                                </p>
                            </span>
                            <span className='right'>
                                <FontAwesomeIcon className="avatar image-status__green" icon="check-circle"/>
                                <span className='info'>
                                    <span className='synch-title'>
                                        <GSTrans t={"lazada.account.product.title.status.synchronized"}/>
                                    </span>
                                </span>
                            </span>
                        </div>
                        {/* ORDERS */}
                        <div className='sp-connected__content'>
                            <span className='left'>
                                <p className='title'>
                                    <GSTrans t={ "page.saleChannel.account.order.title"} values={{saleChannel: 'GoMua'}}/>
                                </p>
                                <p className='description'>
                                    <GSTrans t={"page.saleChannel.account.order.description"} values={{saleChannel: 'GoMua', provider: AgencyService.getDashboardName()}}/>
                                </p>
                            </span>
                            <span className='right'>
                                <FontAwesomeIcon className="avatar image-status__green" icon="check-circle"/>
                                <span className='info'>
                                    <span className='synch-title'>
                                        <GSTrans t={"lazada.account.product.title.status.synchronized"}/>
                                    </span>
                                </span>
                            </span>
                        </div>
                        <div className='sp-connected__content'>
                            <span className='left'>
                                <p className='title'>
                                    <Trans i18nKey="shopee.terms.conditions"/>
                                </p>
                                <p className='description'>
                                    <GSTrans t="page.saleChannel.account.conditions.transaction" values={{saleChannel: 'GoMua'}}/>
                                </p>
                            </span>
                            <span className='right' style={{
                                paddingLeft: '1%'
                            }}>
                                <a href='https://www.gomua.vn/terms-and-conditions' target='_blank' className="gsa-text--non-underline">
                                    <GSButton success outline>
                                        <GSTrans t="page.saleChannel.account.conditions.url" values={{saleChannel: 'GoMua'}}/>
                                    </GSButton>
                                </a>
                            </span>
                        </div>
                    </UikWidget>
                </GSContentBody>
                <ConfirmModalCheckBox ref={(el) => { this.refConfirmModalCheckbox = el }} />
                <ConfirmModalChildren 
                    ref={(el) => { this.refConfirmModalChildren = el }}
                    btnOkName={i18next.t('common.btn.yes')}
                    btnCancelName={i18next.t('common.btn.no')}
                >
                    {i18next.t('shopee.account.product.warning')}
                </ConfirmModalChildren>
            </GSContentContainer>
        );
    }
}
BeecowAccount.propTypes = {
    breakcrums: PropTypes.arrayOf(PropTypes.instanceOf(Breakcrum)),
    shop: PropTypes.instanceOf(ShopeeShopModel)
};

export default BeecowAccount;
