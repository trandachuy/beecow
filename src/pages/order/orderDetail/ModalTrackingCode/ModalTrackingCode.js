/*******************************************************************************
 * Copyright 2022 (C) Mediastep Software Inc.
 *
 * Created on : 15/06/2022
 * Author: An Hoang <an.hoang.nguyen@mediastep.com>
 *******************************************************************************/
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Modal from 'reactstrap/es/Modal';
import ModalHeader from 'reactstrap/es/ModalHeader';
import ModalBody from 'reactstrap/es/ModalBody';
import ModalFooter from 'reactstrap/es/ModalFooter';
import {Trans} from 'react-i18next';
import './ModalTrackingCode.sass'
import i18next from 'i18next';
import {AvField, AvForm, AvRadio, AvRadioGroup} from 'availity-reactstrap-validation'
import LoadingScreen from '../../../../components/shared/LoadingScreen/LoadingScreen';
import GSButton from '../../../../components/shared/GSButton/GSButton';
import {GSToast} from '../../../../utils/gs-toast';
import {CurrencyUtils} from '../../../../utils/number-format';
import AvFieldCurrency from '../../../../components/shared/AvFieldCurrency/AvFieldCurrency';
import {Currency, CurrencySymbol} from '../../../../components/shared/form/CryStrapInput/CryStrapInput';
import {BCOrderService} from '../../../../services/BCOrderService';
import * as accounting from 'accounting-js';
import AvFieldCountable from '../../../../components/shared/form/CountableAvField/AvFieldCountable';
import paymentService from '../../../../services/PaymentService';
import PaymentService from '../../../../services/PaymentService';
import {FormValidate} from '../../../../config/form-validate'
import catalogService from '../../../../services/CatalogService'

const TRACKING_CODE_OTHER = 'OTHER'

class ModalTrackingCode extends Component {

    state = {
        isOpen: false,
        onRedirect: false,
        isLoading: false,
        emptyTrackingCode: true,
        emptyShipping: true,
        emptySelectShippingProvider: true,
        shippingProviderList: [],
        selectShippingProvider: null,
        isChange:false
    }

    constructor(props) {
        super(props)

        this.onOpen = this.onOpen.bind(this);
        this.onClose = this.onClose.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.handleValidSubmit = this.handleValidSubmit.bind(this);
        this.handleIsChange = this.handleIsChange.bind(this);
    }

    onOpen() {
        catalogService.getShippingProviderList()
            .then(result => {
                this.setState({
                    shippingProviderList: result
                })
            })
        this.setState({
            isOpen: true,
            selectShippingProvider: this.props.carrierCode,
            emptyTrackingCode: !this.props.trackingCode,
            emptyShipping: !this.props.selfShippingProviderName,
            emptySelectShippingProvider: !this.props.carrierCode,
        })
    }

    onClose() {
        this.setState({
            isOpen: false,
            emptyTrackingCode: true,
            emptyShipping: true,
            emptySelectShippingProvider: true,
            isChange: false,
            selectShippingProvider: null,
        })
    }

    onSubmit() {
        this.refSubmit.click()
    }

    handleValidSubmit(e, v) {
        const {isChange, emptyTrackingCode, emptyShipping, emptySelectShippingProvider} = this.state
        const request = {
            orderId: this.props.order.orderInfo.orderId,
            trackingCode: v.trackingCode,
            selfShippingProviderName:this.state.selectShippingProvider === TRACKING_CODE_OTHER ? v.selfShippingProviderName : '',
            carrierCode: this.state.selectShippingProvider
        }

        if(isChange && (emptyTrackingCode || (this.state.selectShippingProvider === TRACKING_CODE_OTHER ? emptyShipping : false) || emptySelectShippingProvider)){
            return
        }
        
        if (_.isEmpty(request.trackingCode) && _.isEmpty(request.selfShippingProviderName)){
            this.setState({
                isOpen: false
            })
            return
        }
        
        this.setState({
            isOpen: false,
            isLoading: true
        })
      
        BCOrderService.updateTrackingCode(request)
            .then(result => {
                //check active confirm order
                if (this.props.isConfirm) {
                    this.props.callBackComfirmOrder()
                }

                this.setState({
                    isLoading: false
                })
                if (this.props.okCallback) {
                    this.props.okCallback()
                }
                this.onClose()
            })
            .catch(err => {
                this.setState({
                    isLoading: false
                })
                if (this.props.okCallback) {
                    this.props.okCallback()
                }
                this.onClose()
            })
    }

    handleIsChange(e) {
        const value = e.currentTarget.value
        const name = e.currentTarget.name
        const {emptyTrackingCode, emptyShipping, emptySelectShippingProvider} = this.state
        if (_.isEmpty(value) && 
            (name === 'trackingCode' ? true : emptyTrackingCode) && 
            (name === 'selfShippingProviderName' ? true : emptyShipping) && 
            (name === 'shippingProviderList' ? true : emptySelectShippingProvider)){
            this.setState({
                isChange: false
            })
            return
        }
        this.setState({
            isChange: true
        })
        
    }

    render() {
        return (
            <>
                { this.state.isLoading ?
                    <LoadingScreen/>
                    :
                    <Modal isOpen={ this.state.isOpen } toggle={ this.onClose }
                           className="modal-dialog-centered modal-tracking-code model-mw-300px">
                        <ModalHeader toggle={ this.onClose }>
                            <Trans i18nKey="page.order.detail.trackingCode.title"/>
                        </ModalHeader>
                        <ModalBody>
                            <AvForm onValidSubmit={ this.handleValidSubmit } autoComplete="off">
                                <button hidden ref={ el => this.refSubmit = el }/>
                                <AvFieldCountable
                                    maxLength={ 50 }
                                    minLength={ 0 }
                                    name="trackingCode"
                                    className={this.state.isChange && this.state.emptyTrackingCode ? 'tracking-code border-error' : 'tracking-code' }
                                    value={ this.props.trackingCode }
                                    onBlur={ (e) => {
                                        this.handleIsChange(e)
                                        this.setState({
                                            trackingCode: e.currentTarget.value,
                                            emptyTrackingCode: !e.currentTarget.value,
                                            
                                        })
                                    } }
                                    label={ i18next.t('page.order.detail.trackingCode.input1') }
                                    placeholder={ i18next.t('page.order.detail.trackingCode.title') }
                                />
                                { this.state.isChange && this.state.emptyTrackingCode &&
                                <div
                                    className='invalid-feedback-error'>{ i18next.t('page.order.detail.trackingCode.error') }</div>
                                }
                                <AvField
                                    key={ this.state.selectShippingProvider }
                                    type="select"
                                    name="shippingProviderList"
                                    label={i18next.t('page.order.detail.trackingCode.input2')}
                                    onChange={ e => {
                                        this.handleIsChange(e)
                                        this.setState({
                                            selectShippingProvider:e.currentTarget.value,
                                            emptySelectShippingProvider: !e.currentTarget.value,
                                        })
                                    } }
                                    defaultValue={ this.state.selectShippingProvider }
                                    className={this.state.isChange && this.state.emptySelectShippingProvider ? 'shipping-provider-list border-error' : 'shipping-provider-list' }
                                >
                                    <option value={ '' }>{i18next.t('page.order.detail.trackingCode.selectProvider')}</option>
                                    {
                                        this.state.shippingProviderList.map((country, indexCountry) =>
                                            <optgroup key={ indexCountry } label={country.countryName}>
                                                {
                                                    country.paypalCarrierList?.map((x, index) =>
                                                        <option key={ index } value={ x.carrierCode }>{ x.carrierName }</option>
                                                    )
                                                }
                                            </optgroup>
                                        )
                                    }
                                    
                                </AvField>
                                {this.state.isChange && this.state.emptySelectShippingProvider &&
                                <div
                                    className='invalid-feedback-error'>{i18next.t('page.order.detail.trackingCode.selectProvider.error')}</div>
                                }
                                { this.state.selectShippingProvider === TRACKING_CODE_OTHER &&
                                    <>
                                        <AvFieldCountable
                                            maxLength={ 150 }
                                            minLength={ 0 }
                                            name="selfShippingProviderName"
                                            className={this.state.isChange && this.state.emptyShipping ? 'shipping-provider border-error' : 'shipping-provider' }
                                            value={ this.props.selfShippingProviderName }
                                            onBlur={ (e) => {
                                                this.handleIsChange(e)
                                                this.setState({
                                                    selfShippingProviderName: e.currentTarget.value,
                                                    emptyShipping: !e.currentTarget.value,
                                                })
                                            } }
                                            label={ i18next.t('page.order.detail.trackingCode.selectProvider') }
                                            placeholder={ i18next.t('page.order.detail.trackingCode.placeholder.input2') }
                                        />
                                        { this.state.isChange && this.state.emptyShipping &&
                                        <div
                                            className='invalid-feedback-error'>{ i18next.t('page.order.detail.shippingProvider.error') }</div>
                                        }
                                    </>
                                }
                            </AvForm>
                        </ModalBody>
                        <ModalFooter className="ready-to-ship-confirm__btn-wrapper gs-modal__footer--no-top-border">
                            <GSButton secondary outline onClick={ this.onClose }>
                                <Trans i18nKey="common.btn.cancel"/>
                            </GSButton>
                            <GSButton success marginLeft onClick={ this.onSubmit }>
                                <Trans i18nKey="common.btn.confirm"/>
                            </GSButton>
                        </ModalFooter>
                    </Modal> }
            </>
        );
    }
}

ModalTrackingCode.propTypes = {
    order: PropTypes.object,
    trackingCode: PropTypes.string,
    selfShippingProviderName: PropTypes.string,
    carrierCode: PropTypes.string,
    isConfirm: PropTypes.bool,
    okCallback: PropTypes.func,
    callBackComfirmOrder: PropTypes.func
}

export default ModalTrackingCode;
