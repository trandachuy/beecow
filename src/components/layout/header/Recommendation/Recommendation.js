import React, {useEffect, useState} from 'react'
import Loading from '../../../shared/Loading/Loading'
import beehiveService from '../../../../services/BeehiveService'
import {CredentialUtils} from '../../../../utils/credential'
import {bool, object, oneOf} from 'prop-types'
import {Link, withRouter} from 'react-router-dom'
import GSWidget from '../../../shared/form/GSWidget/GSWidget'
import GSWidgetContent from '../../../shared/form/GSWidget/GSWidgetContent'
import i18next from 'i18next'
import {DateTimeUtils} from '../../../../utils/date-time'
import {Trans} from 'react-i18next'
import {NAV_PATH} from '../../navigation/Navigation'

const Recommendation = props => {
    const { screenType, toggle, style } = props

    const [stIsFetching, setStIsFetching] = useState(true)
    const [stRecommendations, setStRecommendations] = useState([])

    useEffect(() => {
        if (!toggle) {
            return
        }

        setStIsFetching(true)

        beehiveService.getSystemRecommends()
            .then(recommends => {
                setStIsFetching(false)
                setStRecommendations(recommends.content)
            })
    }, [toggle])

    const renderCallCenterConnectedRecommendation = (recommend, index) => {
        return (
            <GSWidget className="shortcut-card shortcut-card-recommend shortcut-card--blue-label"
                      key={ `recommend-${ index }` }>
                <div className="shortcut-card-recommend--icon">
                    <img src="assets/images/call_center/call_center.svg"/>
                </div>
                <GSWidgetContent className="shortcut-card-recommend--content">
                    <span className="highlight">
                        { i18next.t('page.home.recommend.callCenter.connected') }
                    </span>
                    <span className="sub">
                        { i18next.t('page.home.recommend.callCenter.connected.sub') }
                    </span>
                    <div className="time">
                        { DateTimeUtils.formatFromNow(recommend.createdDate) }
                    </div>
                </GSWidgetContent>
            </GSWidget>
        );
    }

    const renderCallCenterExpiredRecommendation = (recommend, index) => {
        return (
            <GSWidget className="shortcut-card shortcut-card-recommend shortcut-card--red-label"
                      key={ `recommend-${ index }` }>
                <div className="shortcut-card-recommend--icon">
                    <img src="assets/images/call_center/call_center_expiring_extension.svg"/>
                </div>
                <GSWidgetContent className="shortcut-card-recommend--content">
                    <span className="highlight">
                        { i18next.t('page.home.recommend.callCenter.expired') }
                    </span>
                    <Trans i18nKey="page.home.recommend.callCenter.expired.sub" className="sub">
                        <b>{ { extNumber: recommend.targetProperty.extension } }</b>
                    </Trans>
                    <span className="link">
                        <Link
                            to={ `${ NAV_PATH.settingsCallCenterPlans }?renewId=${ recommend.targetProperty.renewId }` }>
                            { i18next.t('layout.header.expiredPlanBar.btn.renew') }
                        </Link> |
                        <Link
                            to={ `${ NAV_PATH.settings }` }>
                            { i18next.t('page.setting.account.see_plan') }
                        </Link>
                    </span>
                    <div className="time">
                        { DateTimeUtils.formatFromNow(recommend.createdDate) }
                    </div>
                </GSWidgetContent>
            </GSWidget>
        );
    }

    const renderProdOutOfStockRecommendation = (recommend, index) => {
        return (
            <GSWidget className="shortcut-card shortcut-card-recommend shortcut-card--green-label"
                      key={ `recommend-${ index }` }>
                <div className="shortcut-card-recommend--icon">
                    <img src="assets/images/icon_recommend_product.svg"/>
                </div>
                <GSWidgetContent className="shortcut-card-recommend--content">
                    <span className="highlight">
                        { i18next.t('page.home.recommend.outofstock') }
                    </span>
                    <span className="sub">
                        { i18next.t('page.home.recommend.outofstock.sub') }
                    </span>
                    <span className="link">
                        <Link
                            to={ `${ NAV_PATH.productEdit }/${ recommend.targetId }` }>{ recommend.targetProperty.name }</Link>
                    </span>
                    <div className="time">
                        { DateTimeUtils.formatFromNow(recommend.createdDate) }
                    </div>
                </GSWidgetContent>
            </GSWidget>
        );
    }

    const renderPackageExpireRecommendation = (recommend, index) => {
        return (
            <GSWidget className="shortcut-card shortcut-card-recommend shortcut-card--red-label"
                      key={ `recommend-${ index }` }>
                <div className="shortcut-card-recommend--icon">
                    <img src="assets/images/icon_recommend_expire.svg"/>
                </div>
                <GSWidgetContent className="shortcut-card-recommend--content">
                    <span className="highlight">
                        { i18next.t('page.home.recommend.packageexpire') }
                    </span>
                    <span className="sub">
                        { i18next.t('page.home.recommend.packageexpire.sub', { packageName: recommend.targetProperty.name }) }
                    </span>
                    <span className="link">
                        <Link
                            to={ `${ NAV_PATH.settingsPlans }?currentStep=2&packageId=${ recommend.targetProperty.packageId }&expiredId=${ recommend.targetProperty.expiredId }` }>{ i18next.t('layout.header.expiredPlanBar.btn.renew') }</Link> | <Link
                        to={ `${ NAV_PATH.settingsPlans }` }>{ i18next.t('page.setting.account.see_plan') }</Link>
                    </span>
                    <div className="time">
                        { DateTimeUtils.formatFromNow(recommend.createdDate) }
                    </div>
                </GSWidgetContent>
            </GSWidget>
        );
    }

    const renderBankTransferDisableRecommendation = (recommend, index) => {
        return (
            <GSWidget className="shortcut-card shortcut-card-recommend shortcut-card--blue-label"
                      key={ `recommend-${ index }` }>
                <div className="shortcut-card-recommend--icon">
                    <img src="assets/images/icon_recommend_banktransfer.svg"/>
                </div>
                <GSWidgetContent className="shortcut-card-recommend--content">
                    <span className="highlight">
                        { i18next.t('page.home.recommend.banktransfer') }
                    </span>
                    <span className="sub">
                        { i18next.t('page.home.recommend.banktransfer.sub', { packageName: recommend.targetProperty.name }) }
                    </span>
                    <span className="link">
                        <Link
                            to={ `${ NAV_PATH.setting.SHIPPING_PAYMENT }` }>{ i18next.t('page.setting.bankInfo.title') }</Link>
                    </span>
                    <div className="time">
                        { DateTimeUtils.formatFromNow(recommend.createdDate) }
                    </div>
                </GSWidgetContent>
            </GSWidget>
        );
    }

    const renderDisableSelfDelivery = (recommend, index) => {
        return (
            <GSWidget className="shortcut-card shortcut-card-recommend shortcut-card--blue-label"
                      key={ `recommend-${ index }` }>
                <div className="shortcut-card-recommend--icon">
                    <img src="assets/images/icon_recommend_selfdelivery.svg"/>
                </div>
                <GSWidgetContent className="shortcut-card-recommend--content">
                    <span className="highlight">
                        { i18next.t('page.home.recommend.selfdelivery') }
                    </span>
                    <span className="sub">
                        { i18next.t('page.home.recommend.selfdelivery.sub') }
                    </span>
                    <span className="link">
                        <Link
                            to={ `${ NAV_PATH.setting.SHIPPING_PAYMENT }` }>{ i18next.t('page.home.recommend.selfdelivery.link.title') }</Link>
                    </span>
                    <div className="time">
                        { DateTimeUtils.formatFromNow(recommend.createdDate) }
                    </div>
                </GSWidgetContent>
            </GSWidget>
        );
    }

    const renderPwdExpiry = (recommend, index) => {
        return (
            <GSWidget className="shortcut-card shortcut-card-recommend shortcut-card--red-label"
                      key={ `recommend-${ index }` }>
                <div className="shortcut-card-recommend--icon">
                    <img src="assets/images/icon_change_pwd.svg"/>
                </div>
                <GSWidgetContent className="shortcut-card-recommend--content">
                    <span className="highlight">
                        { i18next.t('page.home.recommend.pwdexpired') }
                    </span>
                    <span className="sub">
                        { i18next.t('page.home.recommend.pwdexpired.sub') }
                    </span>
                    <span className="link">
                        <Link
                            to={ `${ NAV_PATH.setting.ROOT }` }>{ i18next.t('page.setting.resetPassword.title') }</Link>
                    </span>
                    <div className="time">
                        { DateTimeUtils.formatFromNow(recommend.createdDate) }
                    </div>
                </GSWidgetContent>
            </GSWidget>
        );
    }

    const renderRecommendations = () => {
        if (!stRecommendations.length) {
            return

        }
        return (
            <div className="card-col gs-atm__scrollbar-1">
                {
                    stRecommendations.map((value, index) => {
                        switch (value.type) {
                            case 'CALL_CENTER_CONNECTED':
                                return renderCallCenterConnectedRecommendation(value, index);
                            case 'EXTENSION_EXPIRE':
                                return renderCallCenterExpiredRecommendation(value, index);
                            case 'PRODUCT_OUT_OF_STOCK':
                                return renderProdOutOfStockRecommendation(value, index);
                            case 'PACKAGE_EXPIRE':
                                return renderPackageExpireRecommendation(value, index);
                            case 'BANK_TRANSFER_DISABLE':
                                return renderBankTransferDisableRecommendation(value, index);
                            case 'SELF_DELIVERY_DISABLE':
                                return renderDisableSelfDelivery(value, index);
                            case 'PASSWORD_EXPIRE':
                                return renderPwdExpiry(value, index);
                        }
                    })
                }
            </div>
        )
    }

    return (
        <div style={ toggle ? style : {} } className={ ['modal-notification', toggle ? 'show' : ''].join(' ') }>
            { renderRecommendations() }
            { stIsFetching && <Loading/> }
        </div>
    )
}

Recommendation.defaultProps = {
    toggle: false,
    style: {}
}

Recommendation.propTypes = {
    toggle: bool,
    style: object
}

export default withRouter(Recommendation)