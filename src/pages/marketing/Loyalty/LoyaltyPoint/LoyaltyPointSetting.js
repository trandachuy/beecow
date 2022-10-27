import './LoyaltyPointSetting.sass'

import React, {useEffect, useRef, useState} from 'react'
import {RouteUtils} from '../../../../utils/route'
import {NAV_PATH} from '../../../../components/layout/navigation/Navigation'
import GSContentContainer from '../../../../components/layout/contentContainer/GSContentContainer'
import GSContentHeader from '../../../../components/layout/contentHeader/GSContentHeader'
import i18next from 'i18next'
import GSContentBody from '../../../../components/layout/contentBody/GSContentBody'
import {Col, Row} from 'reactstrap'
import GSTrans from '../../../../components/shared/GSTrans/GSTrans'
import {AvField, AvForm} from "availity-reactstrap-validation"
import AvFieldToggle from '../../../../components/shared/AvFieldToggle/AvFieldToggle'
import AvCustomCheckbox from '../../../../components/shared/AvCustomCheckbox/AvCustomCheckbox'
import AvFieldCurrency from '../../../../components/shared/AvFieldCurrency/AvFieldCurrency'
import {FormValidate} from '../../../../config/form-validate'
import GSImg from '../../../../components/shared/GSImg/GSImg'
import GSContentHeaderRightEl
    from '../../../../components/layout/contentHeader/ContentHeaderRightEl/GSContentHeaderRightEl'
import GSButton from '../../../../components/shared/GSButton/GSButton'
import beehiveService from '../../../../services/BeehiveService'
import {GSToast} from '../../../../utils/gs-toast'
import {withRouter} from 'react-router-dom'
import GSAlertModal, {GSAlertModalType} from '../../../../components/shared/GSAlertModal/GSAlertModal'
import {v4 as uuidv4} from 'uuid'
import { CurrencyUtils } from '../../../../utils/number-format'

const STORE_CURRENCY_SYMBOL = CurrencyUtils.getLocalStorageSymbol()

const LoyaltyPointSetting = (props) => {
    const [stSaving, setStSaving] = useState(false)
    const [stSetting, setStSetting] = useState()
    const [stClearPoint, setStClearPoint] = useState(false)
    const [stRenderSwitchEnable, setStRenderSwitchEnable] = useState(false)
    const [stMinimumValue, setStMinimumValue] = useState(100)

    const refForm = useRef()
    const refAlertModal = useRef()

    useEffect(() => {
        const setting = props.location.state ? props.location.state.loyaltyPointSetting : null

        if (setting) {
            setStSetting(setting)

            return
        }

        beehiveService.getLoyaltyPointSettingByStore()
            .then(setting => {
                if (!setting) {
                    RouteUtils.redirectWithoutReload(props, NAV_PATH.loyaltyPointIntro)
                }

                setStSetting(setting)
            })
    }, [])

    useEffect(() => {
        if (STORE_CURRENCY_SYMBOL != 'đ') {
            setStMinimumValue(1)
        }
    },[])

    const handleValidSubmit = (e, data) => {
        setStSaving(true)

        const setting = {
            ...stSetting,
            ...data,
            exchangePoint: 1
        }

        beehiveService.updateLoyaltyPointOfStore(stClearPoint, setting)
            .then(() => {
                RouteUtils.redirectWithoutReload(props, NAV_PATH.loyaltyPointSetting)
                GSToast.commonUpdate()
            })
            .catch(() => {
                GSToast.commonError()
            })
            .finally(() => setStSaving(false))
    }

    const getStatusLabelOfProgram = () => {
        const status = stSetting.enabled ? 'enable' : 'disable'

        return i18next.t(`page.loyaltyPoint.setting.pointProgram.status.${status}`)
    }

    const handleEnable = (isEnable) => {
        if (isEnable) {
            setStSetting(setting => ({
                ...setting,
                enabled: true
            }))
            setStRenderSwitchEnable(toggle => !toggle)
            return
        }

        refAlertModal.current.openModal({
            messageHtml: true,
            type: GSAlertModalType.ALERT_TYPE_DANGER,
            modalAcceptBtn: i18next.t('page.loyaltyPoint.setting.clearPoint.btn.yes'),
            modalCloseBtn: i18next.t('page.loyaltyPoint.setting.clearPoint.btn.cancel'),
            messages: (
                <>
                    <span className='font-weight-500'><GSTrans t='page.loyaltyPoint.setting.clearPoint.message'/></span>
                    <AvForm autoComplete="off" className='mt-3'>
                        <AvCustomCheckbox
                            name='checkbox-enable-expiry-date'
                            classWrapper='checkbox__clear-point'
                            label={i18next.t('page.loyaltyPoint.setting.clearPoint.checkbox')}
                            value={stClearPoint}
                            onChange={(e) => setStClearPoint(e.currentTarget.value)}
                        />
                    </AvForm>
                </>
            ),
            acceptCallback: () => {
                setStSetting(setting => ({
                    ...setting,
                    enabled: false
                }))
                setStRenderSwitchEnable(toggle => !toggle)
            },
            closeCallback: () => {
                setStSetting(setting => ({
                    ...setting,
                    enabled: true
                }))
                setStRenderSwitchEnable(toggle => !toggle)
            }
        })
    }

    const handleEnableExpiryDate = (e) => {
        setStSetting(setting => ({
            ...setting,
            enableExpiryDate: e.currentTarget.value
        }))
    }

    const handleEnableCheckouted = (e) => {
        setStSetting(setting => ({
            ...setting,
            checkouted: e.currentTarget.value
        }))
    }

    const validateEarningRate = (value, ctx, input, cb) => {
        const minValue = 1/100;
        const maxValue = 99999999999;
        const rateAmount = ctx.rateAmount

        if (!rateAmount) {
            cb(true)
        }

        if (rateAmount < minValue || rateAmount > maxValue) {
            cb(i18next.t("page.loyaltyPoint.setting.error.earningRate.invalid.minimum"))
        } else {
            cb(true)
        }
    }

    const validateRedeemPoints = (value, ctx, input, cb) => {
        const minValue = 1/100;
        const maxValue = 99999999999;
        const exchangeAmount = ctx.exchangeAmount

        if (!exchangeAmount) {
            cb(true)
        }

        if (exchangeAmount < minValue || exchangeAmount > maxValue) {
            cb(i18next.t("page.loyaltyPoint.setting.error.earningRate.invalid.minimum"))
        } else {
            cb(true)
        }
    }

    const renderPointProgramDetail = () => {
        return (
            <Row>
                <Col md={2} className='p-0 font-weight-bold align-items-center'>
                    <div className='loyalty-point-setting-section__title'>
                        <GSTrans t="page.loyaltyPoint.setting.pointProgram.title"/>:
                    </div>
                </Col>
                <Col md={10} className='p-0 loyalty-point-setting-section__container d-flex flex-column'>
                    <div className='loyalty-point-setting-section__header'>
                                <span className='d-flex flex-column flex-md-row'>
                                    <GSTrans t='page.loyaltyPoint.setting.pointProgram.status'/>
                                    <span
                                        className='loyalty-point-setting-section__header__status'>{getStatusLabelOfProgram()}</span>
                                </span>
                        <AvFieldToggle
                            key={stRenderSwitchEnable}
                            className='loyalty-point-setting-section__header__toggle'
                            name='toggle-enabled'
                            checked={stSetting.enabled}
                            onChange={handleEnable}
                        />
                    </div>
                    <div className={['loyalty-point-setting-section__body', stSetting.enabled ? '' : 'disable-all'].join(' ')}>
                        <div className='section__title'>
                            <AvCustomCheckbox
                                key={stSetting.enabled}
                                name='checkbox-enable-expiry-date'
                                value={stSetting.enableExpiryDate}
                                disabled={!stSetting.enabled}
                                onChange={handleEnableExpiryDate}
                            />
                            <div className='d-flex flex-column'>
                                        <span className='font-weight-500'>
                                            <GSTrans t='page.loyaltyPoint.setting.pointProgram.enableExpiryDate'/>
                                        </span>
                                <div
                                    className='d-flex font-size-_8rem align-items-md-baseline mt-2 font-weight-normal flex-column flex-md-row'>
                                    <GSTrans t='page.loyaltyPoint.setting.pointProgram.expiredAfter'/>
                                    <div className='d-flex align-items-baseline mt-2 mt-md-0'>
                                        <AvFieldCurrency
                                            key={stSetting.enabled}
                                            name='expirySince'
                                            parentClassName='input__base'
                                            validate={{
                                                ...(stSetting.enableExpiryDate && FormValidate.required()),
                                                ...FormValidate.minValue(1, true),
                                                ...FormValidate.maxValue(1_000_000, true),
                                            }}
                                            value={stSetting.expirySince}
                                            disabled={!stSetting.enabled}
                                            precision={CurrencyUtils.isCurrencyInput(STORE_CURRENCY_SYMBOL) && '0'}
                                            decimalScale={CurrencyUtils.isCurrencyInput(STORE_CURRENCY_SYMBOL) && 0}
                                        />
                                        <span>
                                                    <GSTrans
                                                        t='page.loyaltyPoint.setting.pointProgram.expiredAfter.sub'>
                                                        <b>day(s)</b>since earned
                                                    </GSTrans>
                                                </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className='section__title'>
                            <AvCustomCheckbox
                                key={stSetting.enabled}
                                name='showPoint'
                                value={stSetting.showPoint}
                                disabled={!stSetting.enabled}
                                onChange={e => setStSetting(setting => ({...setting, showPoint: e.currentTarget.value}))}
                            />
                            <GSTrans t='page.loyaltyPoint.setting.pointProgram.showPoint'/>
                        </div>
                    </div>
                </Col>
            </Row>
        )
    }

    const renderEarningPoints = () => {
        return (
            <Row className={['mt-4', stSetting.enabled ? '' : 'disable-all'].join(' ')}>
                <Col md={2} className='p-0 font-weight-bold align-items-center'>
                    <div className='loyalty-point-setting-section__title'>
                        <GSTrans t="page.loyaltyPoint.setting.earningPoint.title"/>:
                    </div>
                </Col>
                <Col md={10} className='p-0 loyalty-point-setting-section__container'>
                    <div className='loyalty-point-setting-section__header'>
                        <GSTrans t='page.loyaltyPoint.setting.earningPoint.description'/>
                    </div>
                    <div className='loyalty-point-setting-section__body'>
                        <div className='section__title'>
                            <AvCustomCheckbox
                                name='purchased'
                                value={stSetting.purchased}
                                disabled
                            />
                            <div className='d-flex flex-column'>
                                <span>
                                    <GSTrans t='page.loyaltyPoint.setting.earningPoint.purchased'/>
                                </span>
                                <div
                                    className='d-flex font-size-_8rem align-items-md-baseline mt-2 font-weight-normal flex-column flex-md-row'>
                                    <GSTrans t='page.loyaltyPoint.setting.earningPoint.willEarn'/>
                                    <div className='d-flex align-items-baseline mt-2 mt-md-0'>
                                        <AvFieldCurrency
                                            key={stSetting.enabled}
                                            name='ratePoint'
                                            parentClassName='input__base'
                                            validate={{
                                                ...FormValidate.required(),
                                                ...FormValidate.minValue(1, true),
                                                ...FormValidate.maxValue(1_000_000, true)
                                            }}
                                            value={stSetting.ratePoint}
                                            disabled={!stSetting.enabled}
                                            onBlur={() => setStSetting(setting => ({...setting, ratePoint: setting.ratePoint}))}
                                            precision={CurrencyUtils.isCurrencyInput(STORE_CURRENCY_SYMBOL) && '0'}
                                            decimalScale={CurrencyUtils.isCurrencyInput(STORE_CURRENCY_SYMBOL) && 0}
                                        />
                                        <span>
                                                    <GSTrans t='page.loyaltyPoint.setting.pointProgram.forEach'>
                                                        <b>point(s)</b> for each
                                                    </GSTrans>
                                                </span>
                                    </div>
                                    <div className='d-flex align-items-baseline mt-2 mt-md-0'>
                                        <AvFieldCurrency
                                            name='rateAmount'
                                            parentClassName='input__base'
                                            validate={{
                                                ...FormValidate.required(),
                                                async: validateEarningRate
                                            }}
                                            value={stSetting.rateAmount}
                                            disabled={!stSetting.enabled}
                                            onBlur={(e) => setStSetting(setting => ({...setting, rateAmount: e.currentTarget.value}))}
                                            precision={CurrencyUtils.isCurrencyInput(STORE_CURRENCY_SYMBOL) && '2'}
                                            decimalScale={CurrencyUtils.isCurrencyInput(STORE_CURRENCY_SYMBOL) && 2}
                                        />
                                        <span>
                                            <GSTrans t='page.loyaltyPoint.setting.pointProgram.spend'
                                                     values={{currency: STORE_CURRENCY_SYMBOL}}>
                                                <b>{STORE_CURRENCY_SYMBOL}</b> spent
                                            </GSTrans>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className='section__title flex-md-row flex-column'>
                            <div className='d-flex'>
                                <AvCustomCheckbox
                                    disabled
                                    name='refered'
                                    value={stSetting.refered}
                                />
                                <span className='disable'><GSTrans
                                    t='page.loyaltyPoint.setting.pointProgram.refer'/></span>
                            </div>
                            <span>
                                        <GSImg className='ml-2' src='/assets/images/loyalty_point/coming_soon.png'
                                               height={20}/>
                                   </span>
                        </div>
                        <div className='section__title flex-md-row flex-column'>
                            <div className='d-flex'>
                                <AvCustomCheckbox
                                    disabled
                                    name='introduced'
                                    value={stSetting.introduced}
                                />
                                <span className='disable'><GSTrans
                                    t='page.loyaltyPoint.setting.pointProgram.introduce'/></span>
                            </div>
                            <span>
                                        <GSImg className='ml-2' src='/assets/images/loyalty_point/coming_soon.png'
                                               height={20}/>
                                   </span>
                        </div>
                    </div>
                </Col>
            </Row>
        )
    }

    const renderRedeemPoints = () => {
        return (
            <Row className={['mt-4', stSetting.enabled ? '' : 'disable-all'].join(' ')}>
                <Col md={2} className='p-0 font-weight-bold align-items-center'>
                    <div className='loyalty-point-setting-section__title'>
                        <GSTrans t="page.loyaltyPoint.setting.redeemPoint.title"/>:
                    </div>
                </Col>
                <Col md={10} className='p-0 loyalty-point-setting-section__container'>
                    <div className='loyalty-point-setting-section__header'>
                        <GSTrans t='page.loyaltyPoint.setting.redeemPoint.description'/>
                    </div>
                    <div className='loyalty-point-setting-section__body'>
                        <div className='section__title'>
                            <AvCustomCheckbox
                                name='checkouted'
                                value={stSetting.checkouted}
                                onChange={handleEnableCheckouted}
                            />
                            <div className='d-flex flex-column'>
                                <span>
                                    <GSTrans t='page.loyaltyPoint.setting.earningPoint.purchased'/>
                                </span>
                                <div
                                    className='d-flex font-size-_8rem align-items-md-baseline mt-2 font-weight-normal flex-column flex-md-row'>
                                    <GSTrans t='page.loyaltyPoint.setting.redeemPoint.exchangeRule'/>
                                    <div className='d-flex align-items-baseline mt-2 mt-md-0'>
                                        <AvFieldCurrency
                                            disabled
                                            type='number'
                                            name='exchangePoint'
                                            parentClassName='disable input__base'
                                            validate={{
                                                ...FormValidate.required(),
                                                ...FormValidate.minValue(1, true),
                                                ...FormValidate.maxValue(1_000_000, true),
                                            }}
                                            value={1}
                                        />
                                        <span>
                                            <GSTrans t='page.loyaltyPoint.setting.redeemPoint.points'>
                                                <b>point(s) = </b>
                                            </GSTrans>
                                        </span>
                                    </div>
                                    <div className='d-flex align-items-baseline mt-2 mt-md-0'>
                                        <AvFieldCurrency
                                            name='exchangeAmount'
                                            parentClassName='input__base'
                                            validate={{
                                                ...(stSetting.checkouted && FormValidate.required()),
                                                async: validateRedeemPoints
                                            }}
                                            value={stSetting.exchangeAmount}
                                            disabled={!stSetting.enabled}
                                            onBlur={e => setStSetting(setting => ({...setting, exchangeAmount: e.currentTarget.value}))}
                                            precision={CurrencyUtils.isCurrencyInput(STORE_CURRENCY_SYMBOL) && '2'}
                                            decimalScale={CurrencyUtils.isCurrencyInput(STORE_CURRENCY_SYMBOL) && 2}
                                        />
                                        <span>
                                            <GSTrans t='page.loyaltyPoint.setting.pointProgram.spend'
                                                     values={{currency: STORE_CURRENCY_SYMBOL}}>
                                                <b>{STORE_CURRENCY_SYMBOL}</b> spent
                                            </GSTrans>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Col>
            </Row>
        )
    }

    return <>
        <GSAlertModal ref={refAlertModal}/>
        {stSetting && <GSContentContainer className="loyalty-point-setting" isSaving={stSaving}>
            <GSContentHeader className='mb-2' title={i18next.t("page.loyaltyPoint.setting.title")}
                             size={GSContentBody.size.MAX}>
                <GSContentHeaderRightEl className="d-flex">
                    <GSButton success onClick={() => refForm.current.submit()}>
                        <GSTrans t='common.btn.save'/>
                    </GSButton>
                    <GSButton default marginLeft onClick={() => RouteUtils.redirectWithoutReload(props, NAV_PATH.loyaltyPointSetting)}>
                        <GSTrans t={"common.btn.cancel"}/>
                    </GSButton>
                </GSContentHeaderRightEl>
            </GSContentHeader>
            <GSContentBody size={GSContentBody.size.MAX}>
                <AvForm onValidSubmit={handleValidSubmit} ref={refForm} autoComplete="off">
                    {renderPointProgramDetail()}
                    {renderEarningPoints()}
                    {renderRedeemPoints()}
                </AvForm>
            </GSContentBody>
        </GSContentContainer>}
    </>
}

export default withRouter(LoyaltyPointSetting)
