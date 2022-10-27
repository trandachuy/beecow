import React, {Component} from 'react';
import {connect} from "react-redux";
import {Col, Row} from 'reactstrap';
import {Link} from "react-router-dom";
import './Customization.sass'
import {Trans} from 'react-i18next';
import storeService from "../../../services/StoreService";
import authenticate from "../../../services/authenticate";
import i18next from "../../../config/i18n";
import AlertModal from "../../../components/shared/AlertModal/AlertModal";
import GSContentContainer from "../../../components/layout/contentContainer/GSContentContainer";
import GSContentHeader from "../../../components/layout/contentHeader/GSContentHeader";
import GSContentBody from "../../../components/layout/contentBody/GSContentBody";
import {cancelablePromise} from "../../../utils/promise";
import GSContentFooter from "../../../components/layout/GSContentFooter/GSContentFooter";
import GSLearnMoreFooter from "../../../components/shared/GSLearnMoreFooter/GSLearnMoreFooter";
import GSWidget from "../../../components/shared/form/GSWidget/GSWidget";
import GSWidgetContent from "../../../components/shared/form/GSWidget/GSWidgetContent";
import Constants from "../../../config/Constant";
import GSButton from "../../../components/shared/GSButton/GSButton";
import * as _ from 'lodash';

class Customization extends Component{
    constructor(props){
        super(props);

        // this.props.dispatch(setPageTitle(process.env.APP_NAME + '-Customization'));
        this.state = {
            detail: {},
            addressList: ''
        }
    }

    componentDidMount() {
        this.props.setLoading();
        this.getStoreInfo = cancelablePromise(storeService.getStorefrontInfo(authenticate.getStoreId()));

        this.getStoreInfo.promise.then((result) => {
                this.setState({detail: result});
                if (result.addressList) {
                    let orgAddresses = result.addressList.split(/\n/);
                    let addresses = _.map(orgAddresses, (x) => {
                        if (!_.startsWith(x, '-')) {
                            x = '- ' + x;
                        }
                        return x;
                    });
                    this.setState({addressList: addresses.join('\n')});
                }
                this.props.cancelLoading();
            },
            () => {
                this.props.cancelLoading();
                this.props.showServerError();
            });

    }

    componentWillUnmount() {
        this.getStoreInfo.cancel();
    }

    render() {
        return (
            <GSContentContainer className="custom-container">
                <GSContentHeader className="custom-container__title gs-page-title"
                                 title={i18next.t("component.storefront.customization")}>
                </GSContentHeader>
                <GSContentBody size={GSContentBody.size.LARGE} className="custom-container__box">
                    <GSWidget>
                        <GSWidgetContent>
                    <Row className="custom-container__design">
                        <Col md={4} className="custom-container__design--left">
                            <label><Trans i18nKey="component.storefront.own.design">Own Design</Trans></label>
                            <p><Trans i18nKey="component.storefront.own.design.desc">This is the theme customers see when they visit your store.</Trans></p>
                        </Col>
                        <Col md={8} className="custom-container__design--right">
                            <img src="/assets/images/own_design.png" />
                            <Link to="/channel/storefront/customization/design">
                                <GSButton success><Trans i18nKey="common.btn.edit">Edit</Trans></GSButton>
                            </Link>
                        </Col>
                    </Row>
                    <Row className="custom-container__info">
                        <Col md={4} className="custom-container__info--left">
                            <label><Trans i18nKey="component.storefront.general.info">General info</Trans></label>
                            <p><Trans i18nKey="component.storefront.general.info.desc">This is shop information customers see when they order your products.</Trans></p>
                        </Col>
                        <Col md={8} className="custom-container__info--right">
                            <div className="custom-container__info__address custom-container__info--top">
                                <b><Trans i18nKey="common.txt.email.contact">Email contact</Trans>:</b>
                                <br/>
                                {this.state.detail.email}
                                <Link to="/channel/storefront/customization/info">
                                    <GSButton success className="btn-edit-info"><Trans i18nKey="common.btn.edit">Edit</Trans></GSButton>
                                </Link>
                            </div>
                            <div className="custom-container__info__address custom-container__info--mid">
                                <b><Trans i18nKey="component.storefront.shop.address">Shop address</Trans>:</b>
                                <br/>
                                <p className="address-list">{this.state.addressList}</p>
                            </div>
                            <div className="custom-container__info__address">
                                <b><Trans i18nKey="component.storefront.hotline">Hotline</Trans>:</b>
                                <br/>
                                {this.state.detail.contactNumber}
                                <img src="/assets/images/icon_address.png" />
                            </div>
                        </Col>
                    </Row>
                        </GSWidgetContent>
                    </GSWidget>
                </GSContentBody>

                <GSContentFooter>
                    <GSLearnMoreFooter
                        text={i18next.t("component.navigation.customization")}
                        linkTo={Constants.UrlRefs.LEARN_MORE_CUSTOMIZATION}/>
                </GSContentFooter>

                <AlertModal ref={(el) => { this.alertModal = el }} />
            </GSContentContainer>
        );
    }
}

export default connect()(Customization);
