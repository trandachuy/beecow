/*
 * ******************************************************************************
 *  * Copyright 2017 (C) MediaStep Software Inc.
 *  *
 *  * Created on : 15/10/2021
 *  * Author: Minh Tran <minh.tran@mediastep.com>
 *  ******************************************************************************
 */

import './AffiliateSetting.sass'
import React, {useContext, useEffect, useRef, useState} from 'react'
import GSAlertModal from '../../../components/shared/GSAlertModal/GSAlertModal'
import GSContentContainer from '../../../components/layout/contentContainer/GSContentContainer'
import GSContentHeader from '../../../components/layout/contentHeader/GSContentHeader'
import i18next from 'i18next'
import GSContentBody from '../../../components/layout/contentBody/GSContentBody'
import GSContentHeaderRightEl
    from '../../../components/layout/contentHeader/ContentHeaderRightEl/GSContentHeaderRightEl'
import GSButton from '../../../components/shared/GSButton/GSButton'
import GSTrans from '../../../components/shared/GSTrans/GSTrans'
import {RouteUtils} from '../../../utils/route'
import {NAV_PATH} from '../../../components/layout/navigation/Navigation'
import {AvForm} from 'availity-reactstrap-validation'
import AvFieldCurrency from '../../../components/shared/AvFieldCurrency/AvFieldCurrency'
import {FormValidate} from '../../../config/form-validate'
import GSTooltip, {GSTooltipIcon, GSTooltipPlacement} from '../../../components/shared/GSTooltip/GSTooltip'
import Row from 'reactstrap/es/Row'
import AvFieldToggle from '../../../components/shared/AvFieldToggle/AvFieldToggle'
import AvCustomCheckbox from '../../../components/shared/AvCustomCheckbox/AvCustomCheckbox'
import Col from 'reactstrap/es/Col'
import {AffiliateContext} from '../context/AffiliateContext'
import affiliateService from '../../../services/AffiliateService'
import {GSToast} from '../../../utils/gs-toast'
import {UikRadio, UikFormInputGroup} from '../../../@uik'
import {AffiliateConstant} from '../context/AffiliateConstant'

const AffiliateSetting = props => {
    const { state } = useContext(AffiliateContext.context)
    const {
        isDropShipActive,
        isResellerActive,
        isDropShipExpired,
        isResellerExpired
    } = state || {}

    const [stIsNoDropShip, setStIsNoDropShip] = useState(false)
    const [stIsNoReseller, setStIsNoReseller] = useState(false)
    const [stSaving, setStSaving] = useState(false)
    const [stLoading, setStLoading] = useState(true)
    const [stSetting, setStSetting] = useState({})
    const [stError, setStError] = useState({
        autoApproveOrder: '',
        notifyNewOrder: '',
        updateProductChange: ''
    })

    const refForm = useRef()
    const refAlertModal = useRef()

    useEffect(() => {
        affiliateService.getSettingByStore()
            .then(setting => setStSetting(setting))
            .catch(e => {
                console.error('Error when get setting by store ', e)
            })
            .finally(() => setStLoading(false))
    }, [])

    useEffect(() => {
        setStIsNoDropShip(!isDropShipActive || isDropShipExpired)
        setStIsNoReseller(!isResellerActive || isResellerExpired)
    }, [isDropShipActive, isResellerActive, isDropShipExpired, isResellerExpired])

    const isValid = () => {
        let error = {}

        if (stSetting.autoApproveOrder && !stSetting.autoApproveOrderDropship && !stSetting.autoApproveOrderReseller) {
            error.autoApproveOrder = i18next.t('page.affiliate.setting.error.selectOption')
        }
        if (stSetting.notifyNewOrder && !stSetting.notifyNewOrderDropship && !stSetting.notifyNewOrderReseller) {
            error.notifyNewOrder = i18next.t('page.affiliate.setting.error.selectOption')
        }
        if (stSetting.updateProductChange && !stSetting.updateProductChangePrice && !stSetting.updateProductChangeInfo) {
            error.updateProductChange = i18next.t('page.affiliate.setting.error.selectOption')
        }

        setStError(error)

        return _.isEmpty(error)
    }

    const handleValidSubmit = () => {
        if (!isValid()) {
            return
        }
        setStSaving(true)
        affiliateService.updateSetting(stSetting)
            .then(setting => {
                setStSetting(setting)
                GSToast.commonUpdate()
            })
            .catch(e => {
                console.error('Error when get setting by store ', e)
                GSToast.commonError()
            })
            .finally(() => setStSaving(false))
    }

    const renderCookieExpiryTime = () => {
        return (
            <Col>
                <div className="p-0 affiliate-setting-section__container d-flex flex-column">
                    <div className="affiliate-setting-section__header">
                        <GSTrans t="page.affiliate.setting.cookieExpiryTime"/>
                        <GSTooltip message={ i18next.t('page.affiliate.setting.cookieExpiryTime.hint') }
                                   icon={ GSTooltipIcon.INFO_CIRCLE } placement={ GSTooltipPlacement.RIGHT }/>
                    </div>
                    <div className="affiliate-setting-section__body">
                        <div
                            className={ ['section__title align-items-center', stIsNoDropShip ? 'disabled' : ''].join(' ') }>
                            <AvFieldCurrency
                                type="number"
                                name="cookieExpiryTime"
                                parentClassName="input__base"
                                validate={ {
                                    ...FormValidate.required(),
                                    ...FormValidate.minValue(1, true),
                                    ...FormValidate.maxValue(36_500, true)
                                } }
                                value={ stSetting.cookieExpiryTime }
                                onBlur={ e => setStSetting(setting => ({
                                    ...setting,
                                    cookieExpiryTime: e.currentTarget.value
                                })) }
                            />
                            <GSTrans t="page.affiliate.setting.cookieExpiryTime.day"/>
                        </div>
                    </div>
                </div>
            </Col>
        )
    }

    const renderAutoApproveOrderCommission = () => {
        return (
            <Col>
                <div className="p-0 affiliate-setting-section__container d-flex flex-column">
                    <div className="affiliate-setting-section__header">
                        <GSTrans t="page.affiliate.setting.autoApproveOrder"/>
                        <AvFieldToggle
                            className="affiliate-setting-section__header__toggle"
                            name="autoApproveOrder"
                            checked={ stSetting.autoApproveOrder }
                            onChange={ isEnable => {
                                setStSetting(setting => ({
                                    ...setting,
                                    autoApproveOrder: isEnable
                                }))
                                setStError(error => ({
                                    ...error,
                                    autoApproveOrder: ''
                                }))
                            } }
                        />
                    </div>
                    <div className="affiliate-setting-section__body">
                        <div className={ stIsNoDropShip ? 'disabled' : '' }>
                            <div className="section__title">
                                <AvCustomCheckbox
                                    key={ stSetting.autoApproveOrder }
                                    name="autoApproveOrderDropship"
                                    value={ stSetting.autoApproveOrderDropship }
                                    disabled={ !stSetting.autoApproveOrder }
                                    onChange={ e => {
                                        setStSetting(setting => ({
                                            ...setting,
                                            autoApproveOrderDropship: e.currentTarget.value,
                                            autoApproveOrderDropshipByType: AffiliateConstant.AUTO_APPROVE_ORDER_TYPE.DELIVERED_ORDERS
                                        }))
                                        setStError(error => ({
                                            ...error,
                                            autoApproveOrder: ''
                                        }))
                                    } }
                                />
                                <GSTrans t="page.affiliate.setting.autoApproveOrder.dropship"/>
                            </div>
                            {
                                stSetting.autoApproveOrderDropship && <div className="section__sub__title">
                                    <UikFormInputGroup key={ stSetting.autoApproveOrderDropshipByType }>
                                        <UikRadio name="autoApproveOrderDropshipByTypeAllOrders"
                                                  defaultChecked={ stSetting.autoApproveOrderDropshipByType === AffiliateConstant.AUTO_APPROVE_ORDER_TYPE.ALL_ORDERS }
                                                  label={ i18next.t('page.affiliate.setting.autoApproveOrder.allOrder') }
                                                  onClick={ () => setStSetting(setting => ({
                                                      ...setting,
                                                      autoApproveOrderDropshipByType: AffiliateConstant.AUTO_APPROVE_ORDER_TYPE.ALL_ORDERS
                                                  })) }/>
                                        <UikRadio name="autoApproveOrderDropshipByTypeDeliveredOrders"
                                                  defaultChecked={ stSetting.autoApproveOrderDropshipByType === AffiliateConstant.AUTO_APPROVE_ORDER_TYPE.DELIVERED_ORDERS }
                                                  label={ i18next.t('page.affiliate.setting.autoApproveOrder.deliveredOrder') }
                                                  onClick={ () => setStSetting(setting => ({
                                                      ...setting,
                                                      autoApproveOrderDropshipByType: AffiliateConstant.AUTO_APPROVE_ORDER_TYPE.DELIVERED_ORDERS
                                                  })) }/>
                                    </UikFormInputGroup>
                                </div>
                            }
                        </div>
                        <div className={ stIsNoReseller ? 'disabled' : '' }>
                            <div className="section__title">
                                <AvCustomCheckbox
                                    key={ stSetting.autoApproveOrder }
                                    name="autoApproveOrderReseller"
                                    value={ stSetting.autoApproveOrderReseller }
                                    disabled={ !stSetting.autoApproveOrder }
                                    onChange={ e => {
                                        setStSetting(setting => ({
                                            ...setting,
                                            autoApproveOrderReseller: e.currentTarget.value,
                                            autoApproveOrderResellerByType: AffiliateConstant.AUTO_APPROVE_ORDER_TYPE.DELIVERED_ORDERS
                                        }))
                                        setStError(error => ({
                                            ...error,
                                            autoApproveOrder: ''
                                        }))
                                    } }
                                />
                                <GSTrans t="page.affiliate.setting.autoApproveOrder.reseller"/>
                            </div>
                            {
                                stSetting.autoApproveOrderReseller && <div className="section__sub__title">
                                    <UikFormInputGroup key={ stSetting.autoApproveOrderResellerByType }>
                                        <UikRadio name="autoApproveOrderResellerByTypeAllOrders"
                                                  defaultChecked={ stSetting.autoApproveOrderResellerByType === AffiliateConstant.AUTO_APPROVE_ORDER_TYPE.ALL_ORDERS }
                                                  label={ i18next.t('page.affiliate.setting.autoApproveOrder.allOrder') }
                                                  onClick={ () => setStSetting(setting => ({
                                                      ...setting,
                                                      autoApproveOrderResellerByType: AffiliateConstant.AUTO_APPROVE_ORDER_TYPE.ALL_ORDERS
                                                  })) }/>
                                        <UikRadio name="autoApproveOrderResellerByTypeDeliveredOrders"
                                                  defaultChecked={ stSetting.autoApproveOrderResellerByType === AffiliateConstant.AUTO_APPROVE_ORDER_TYPE.DELIVERED_ORDERS }
                                                  label={ i18next.t('page.affiliate.setting.autoApproveOrder.deliveredOrder') }
                                                  onClick={ () => setStSetting(setting => ({
                                                      ...setting,
                                                      autoApproveOrderResellerByType: AffiliateConstant.AUTO_APPROVE_ORDER_TYPE.DELIVERED_ORDERS
                                                  })) }/>
                                    </UikFormInputGroup>
                                </div>
                            }
                        </div>
                        { stError.autoApproveOrder && <span className="error">{ stError.autoApproveOrder }</span> }
                    </div>
                </div>
            </Col>
        )
    }

    const renderNotifyNewPartner = () => {
        return (
            <Col>
                <div className="p-0 affiliate-setting-section__container d-flex flex-column">
                    <div className="affiliate-setting-section__header">
                        <GSTrans t="page.affiliate.setting.notifyNewPartner"/>
                        <AvFieldToggle
                            className={ ['affiliate-setting-section__header__toggle', stIsNoDropShip ? 'disabled' : ''].join(' ') }
                            name="notifyNewPartner"
                            checked={ stSetting.notifyNewPartner }
                            onChange={ isEnable => setStSetting(setting => ({
                                ...setting,
                                notifyNewPartner: isEnable
                            })) }
                        />
                    </div>
                </div>
            </Col>
        )
    }

    const renderNotifyNewOrder = () => {
        return (
            <Col>
                <div className="p-0 affiliate-setting-section__container d-flex flex-column">
                    <div className="affiliate-setting-section__header">
                        <GSTrans t="page.affiliate.setting.notifyNewOrder"/>
                        <AvFieldToggle
                            className="affiliate-setting-section__header__toggle"
                            name="notifyNewOrder"
                            checked={ stSetting.notifyNewOrder }
                            onChange={ isEnable => {
                                setStSetting(setting => ({
                                    ...setting,
                                    notifyNewOrder: isEnable
                                }))
                                setStError(error => ({
                                    ...error,
                                    notifyNewOrder: ''
                                }))
                            } }
                        />
                    </div>
                    <div
                        className="affiliate-setting-section__body">
                        <div className={ ['section__title', stIsNoDropShip ? 'disabled' : ''].join(' ') }>
                            <AvCustomCheckbox
                                key={ stSetting.notifyNewOrder }
                                name="notifyNewOrderDropship"
                                value={ stSetting.notifyNewOrderDropship }
                                disabled={ !stSetting.notifyNewOrder }
                                onChange={ e => {
                                    setStSetting(setting => ({
                                        ...setting,
                                        notifyNewOrderDropship: e.currentTarget.value
                                    }))
                                    setStError(error => ({
                                        ...error,
                                        notifyNewOrder: ''
                                    }))
                                } }
                            />
                            <GSTrans t="page.affiliate.setting.notifyNewOrder.dropship"/>
                        </div>
                        <div className={ ['section__title', stIsNoReseller ? 'disabled' : ''].join(' ') }>
                            <AvCustomCheckbox
                                key={ stSetting.notifyNewOrder }
                                name="notifyNewOrderReseller"
                                value={ stSetting.notifyNewOrderReseller }
                                disabled={ !stSetting.notifyNewOrder }
                                onChange={ e => {
                                    setStSetting(setting => ({
                                        ...setting,
                                        notifyNewOrderReseller: e.currentTarget.value
                                    }))
                                    setStError(error => ({
                                        ...error,
                                        notifyNewOrder: ''
                                    }))
                                } }
                            />
                            <GSTrans t="page.affiliate.setting.notifyNewOrder.reseller"/>
                        </div>
                        { stError.notifyNewOrder && <span className="error">{ stError.notifyNewOrder }</span> }
                    </div>
                </div>
            </Col>
        )
    }

    const renderUpdateProductChange = () => {
        return (
            <Col className={ stIsNoReseller ? 'disabled' : '' }>
                <div className="p-0 affiliate-setting-section__container d-flex flex-column">
                    <div className="affiliate-setting-section__header">
                        <GSTrans t="page.affiliate.setting.updateProductChange"/>
                        <AvFieldToggle
                            className="affiliate-setting-section__header__toggle"
                            name="updateProductChange"
                            checked={ stSetting.updateProductChange }
                            onChange={ isEnable => {
                                setStSetting(setting => ({
                                    ...setting,
                                    updateProductChange: isEnable
                                }))
                                setStError(error => ({
                                    ...error,
                                    updateProductChange: ''
                                }))
                            } }
                        />
                    </div>
                    <div
                        className="affiliate-setting-section__body">
                        <div className="section__title">
                            <AvCustomCheckbox
                                key={ stSetting.updateProductChange }
                                name="updateProductChangePrice"
                                value={ stSetting.updateProductChangePrice }
                                disabled={ !stSetting.updateProductChange }
                                onChange={ e => {
                                    setStSetting(setting => ({
                                        ...setting,
                                        updateProductChangePrice: e.currentTarget.value
                                    }))
                                    setStError(error => ({
                                        ...error,
                                        updateProductChange: ''
                                    }))
                                } }
                            />
                            <GSTrans t="page.affiliate.setting.updateProductChange.price"/>
                        </div>
                        <div className="section__title">
                            <AvCustomCheckbox
                                key={ stSetting.updateProductChange }
                                name="updateProductChangeInfo"
                                value={ stSetting.updateProductChangeInfo }
                                disabled={ !stSetting.updateProductChange }
                                onChange={ e => {
                                    setStSetting(setting => ({
                                        ...setting,
                                        updateProductChangeInfo: e.currentTarget.value
                                    }))
                                    setStError(error => ({
                                        ...error,
                                        updateProductChange: ''
                                    }))
                                } }
                            />
                            <GSTrans t="page.affiliate.setting.updateProductChange.info"/>
                        </div>
                        { stError.updateProductChange &&
                        <span className="error">{ stError.updateProductChange }</span> }
                    </div>
                </div>
            </Col>
        )
    }

    return (
        <>
            <GSAlertModal ref={ refAlertModal }/>
            { stSetting &&
            <GSContentContainer className="affiliate-setting" isSaving={ stSaving } isLoading={ stLoading }>
                <GSContentHeader className="mb-2" title={ i18next.t('page.affiliate.setting.title') }
                                 size={ GSContentBody.size.MAX }>
                    <GSContentHeaderRightEl className="d-flex">
                        <GSButton success onClick={ () => refForm.current.submit() }>
                            <GSTrans t="common.btn.save"/>
                        </GSButton>
                        <GSButton default marginLeft
                                  onClick={ () => RouteUtils.redirectWithoutReload(props, NAV_PATH.loyaltyPointSetting) }>
                            <GSTrans t={ 'common.btn.cancel' }/>
                        </GSButton>
                    </GSContentHeaderRightEl>
                </GSContentHeader>
                <GSContentBody size={ GSContentBody.size.MAX }>
                    <AvForm onValidSubmit={ handleValidSubmit } ref={ refForm } autoComplete="off">
                        <Row>
                            { renderCookieExpiryTime() }
                        </Row>
                        <Row>
                            { renderAutoApproveOrderCommission() }
                        </Row>
                        <Row>
                            { renderNotifyNewPartner() }
                        </Row>
                        <Row>
                            { renderNotifyNewOrder() }
                        </Row>
                        <Row>
                            { renderUpdateProductChange() }
                        </Row>
                    </AvForm>
                </GSContentBody>
            </GSContentContainer> }
        </>
    )
}

AffiliateSetting.defaultProps =
    {}

AffiliateSetting.propTypes =
    {}

export default AffiliateSetting
