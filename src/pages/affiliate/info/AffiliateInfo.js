import "./AffiliateInfo.sass";
import React, {useContext, useEffect, useRef, useState} from "react";
import {Trans} from "react-i18next";
import GSButton from "../../../components/shared/GSButton/GSButton";
import i18next from "i18next";
import {RouteUtils} from "../../../utils/route";
import {NAV_PATH} from "../../../components/layout/navigation/Navigation";
import GSContentContainer from "../../../components/layout/contentContainer/GSContentContainer";
import GSContentBody from "../../../components/layout/contentBody/GSContentBody";
import {
    UikToggle,
    UikWidget,
    UikWidgetContent,
    UikWidgetHeader,
} from "../../../@uik";
import {AffiliateContext} from "../context/AffiliateContext";
import GSTrans from "../../../components/shared/GSTrans/GSTrans";
import AlertModal from "../../../components/shared/AlertModal/AlertModal";
import Constants from "../../../config/Constant";
import moment from "moment";
import GSImg from "../../../components/shared/GSImg/GSImg";
import GSContentFooter from "../../../components/layout/GSContentFooter/GSContentFooter";
import GSLearnMoreFooter from "../../../components/shared/GSLearnMoreFooter/GSLearnMoreFooter";
import affiliateService from "../../../services/AffiliateService";
import {GSToast} from "../../../utils/gs-toast";
import {AffiliateConstant} from "../context/AffiliateConstant";
import GSComponentTooltip, { GSComponentTooltipPlacement } from "../../../components/shared/GSComponentTooltip/GSComponentTooltip";
import i18n from "../../../config/i18n";
import ConfirmModal from "../../../components/shared/ConfirmModal/ConfirmModal";
import {TokenUtils} from "../../../utils/token";
import {PACKAGE_FEATURE_CODES} from "../../../config/package-features";
import { CurrencyUtils, NumberUtils } from "../../../utils/number-format";

const STATUS = {
    ACTIVE: "ACTIVE",
    INACTIVE: "INACTIVE",
};

const STORE_CURRENCY_SYMBOL = CurrencyUtils.getLocalStorageSymbol()

const AffiliateInfo = (props) => {
    const {state} = useContext(AffiliateContext.context)
    const {
        isDropShipActive,
        isResellerActive,
        isDropShipExpired,
        isResellerExpired,
        dropShipPackage,
        resellerPackage
    } = state || {}

    const [stTabActive, setStTabActive] = useState(Constants.AFFILIATE_SERVICE_TYPE.DROP_SHIP)
    const [stStatus, setStStatus] = useState(STATUS.ACTIVE)
    const [stCurrentPackage, setStCurrentPackage] = useState()
    const [stPartnerSetting, setStPartnerSetting] = useState()
    const [stPartnerInfo, setStPartnerInfo] = useState({
        totalPartner: 0,
        pendingPartner: 0,
        activePartner: 0,
        deactivatePartner: 0
    })
    const [stPartnerOrderInfo, setStPartnerOrderInfo] = useState({
        totalOrder: 0,
        approvedOrder: 0,
        pendingOrder: 0,
    })
    const [stPartnerCommissionInfo, setStPartnerCommissionInfo] = useState({
        totalRevenue: 0,
        approvedCommissionAmount: 0,
        pendingCommissionAmount: 0,
        rejectCommissionAmount: 0,
        paidCommissionAmount: 0
    })
    const [stStoreAffiliates, setStStoreAffiliates] = useState([])
    const [stCurrentStoreAffiliate, setStCurrentStoreAffiliate] = useState()
    const [stDefaultPrecision, setStDefaultPrecision] = useState()

    const refAlert = useRef()
    const refNotActiveModal = useRef()

    useEffect(() => {
        Promise.all([
            affiliateService.getPartnerSetting(),
            affiliateService.getAllStoreAffiliatesOfStore()
        ])
            .then(([setting, storeAffiliates]) => {
                setStPartnerSetting(setting)
                setStStoreAffiliates(storeAffiliates)
            })
            .catch(() => GSToast.commonError())
        
        if (!TokenUtils.hasAnyPackageFeatures([PACKAGE_FEATURE_CODES.WEB_PACKAGE]) 
            && !TokenUtils.hasAnyPackageFeatures([PACKAGE_FEATURE_CODES.APP_PACKAGE]) 
            && !TokenUtils.hasAnyPackageFeatures([PACKAGE_FEATURE_CODES.POS_PACKAGE])) {
            refNotActiveModal.current.openModal({
                messages: i18n.t('page.affiliate.partner.renew'),
                modalTitle: i18n.t('common.txt.alert.modal.title'),
                modalBtnOk: i18next.t('page.affiliate.button.renew'),
                okCallback: () => {
                    RouteUtils.redirectWithReload(NAV_PATH.settingsPlans)
                }
            })
        }
    }, [])

    useEffect(() => {
        if (_.isUndefined(isDropShipActive) || _.isUndefined(isResellerActive)) {
            return
        }

        if (!isDropShipActive && !isResellerActive) {
            RouteUtils.redirectWithoutReload(props, NAV_PATH.affiliateIntro);
        }
    }, [isDropShipActive, isResellerActive])

    useEffect(() => {
        if (stTabActive === Constants.AFFILIATE_SERVICE_TYPE.DROP_SHIP) {
            if (isDropShipExpired) {
                setStStatus(STATUS.INACTIVE)
            } else if (stPartnerSetting) {
                setStStatus(stPartnerSetting.enabledDropShip ? STATUS.ACTIVE : STATUS.INACTIVE)
            } else {
                setStStatus(isDropShipActive ? STATUS.ACTIVE : STATUS.INACTIVE)
            }
        } else {
            if (isResellerExpired) {
                setStStatus(STATUS.INACTIVE)
            } else if (stPartnerSetting) {
                setStStatus(stPartnerSetting.enabledReseller ? STATUS.ACTIVE : STATUS.INACTIVE)
            } else {
                setStStatus(isResellerActive ? STATUS.ACTIVE : STATUS.INACTIVE)
            }
        }

    }, [stTabActive, isDropShipActive, isResellerActive, isDropShipExpired, isResellerExpired, stPartnerSetting])

    useEffect(() => {
        if(!dropShipPackage && resellerPackage) {
            setStTabActive(Constants.AFFILIATE_SERVICE_TYPE.RESELLER)
        }
    }, [dropShipPackage, resellerPackage])

    useEffect(() => {
        if (stTabActive === Constants.AFFILIATE_SERVICE_TYPE.DROP_SHIP) {
            setStCurrentPackage(dropShipPackage)
            getPartnerInfo(AffiliateConstant.PARTNER_TYPE.DROP_SHIP);
        } else {
            setStCurrentPackage(resellerPackage)
            getPartnerInfo(AffiliateConstant.PARTNER_TYPE.RESELLER);
        }
    }, [stTabActive, dropShipPackage, resellerPackage])

    useEffect(() => {
        if (!stStoreAffiliates.length) {
            return
        }

        const currentStoreAffiliate = stStoreAffiliates.find(s => s.type === stTabActive)

        setStCurrentStoreAffiliate(currentStoreAffiliate)
    }, [stTabActive, stStoreAffiliates])

    useEffect(() => {
        if(STORE_CURRENCY_SYMBOL !== Constants.CURRENCY.VND.SYMBOL){
            setStDefaultPrecision(2)
        }else{
            setStDefaultPrecision(0)
        }
    },[])

    const handleChangeTab = (tab) => {
        setStTabActive(tab)
    }

    const getPartnerInfo = (partnerType) => {
        affiliateService.getPartnerInformationByType(partnerType)
        .then(result =>  {
            setStPartnerInfo({
                totalPartner: result.totalPartner,
                pendingPartner: result.pendingPartner,
                activePartner: result.activePartner,
                deactivatePartner: result.deactivatePartner
            });
        })
        affiliateService.getPartnerOrderInformationByType(partnerType)
        .then(result =>  {
            setStPartnerOrderInfo({
                totalOrder: result.totalOrder,
                approvedOrder: result.approvedOrder,
                pendingOrder: result.pendingOrder,
            })
        })
        affiliateService.getPartnerCommissionInformationByType(partnerType)
        .then(result =>  {
            setStPartnerCommissionInfo({
                totalRevenue: result.totalRevenue,
                approvedCommissionAmount: result.approvedCommissionAmount,
                pendingCommissionAmount: result.pendingCommissionAmount,
                rejectCommissionAmount: result.rejectCommissionAmount,
                paidCommissionAmount: result.paidCommissionAmount
            })
        })
    }

    const handleUpgradeOrRenew = () => {
        RouteUtils.redirectWithReload(NAV_PATH.settingsAffiliatePlans, {
            serviceType: stTabActive
        })
    }

    const isCurrentTabExpired = () => {
        if (stTabActive === Constants.AFFILIATE_SERVICE_TYPE.DROP_SHIP) {
            return isDropShipExpired
        }

        return isResellerExpired
    }

    return (
        <>
            <ConfirmModal ref={refNotActiveModal} modalClass={'affiliateInfo-not-active-modal'}/>
            <AlertModal ref={refAlert}/>
            <GSContentContainer minWidthFitContent className="affiliate-information">
                <GSContentBody size={GSContentBody.size.MAX}
                               className="affiliate-information-content d-desktop-flex">
                    <div className={["row w-100", isCurrentTabExpired() ? 'tab--expired' : ''].join(' ')}>
                        <div className="col-12 reseller-dropship p-0">
                            <div className={`button__container order-tab-item ${!state.dropShipPackage? 'reserved': ''}`}>
                                <button
                                    className={['dropship', stTabActive === Constants.AFFILIATE_SERVICE_TYPE.DROP_SHIP ? 'checked' : ''].join(' ')}
                                    onClick={() => handleChangeTab(Constants.AFFILIATE_SERVICE_TYPE.DROP_SHIP)}>
                                    {i18next.t("page.affiliate.plans.step1.title.DROP_SHIP")}
                                </button>
                                <button
                                    className={["reseller", stTabActive === Constants.AFFILIATE_SERVICE_TYPE.RESELLER ? 'checked' : ''].join(' ')}
                                    onClick={() => handleChangeTab(Constants.AFFILIATE_SERVICE_TYPE.RESELLER)}>
                                    {i18next.t("page.affiliate.plans.step1.title.RESELLER")}
                                </button>
                            </div>
                            <UikWidget className="gs-widget mt-0">
                                <UikWidgetContent className="gs-widget__content order-info-sm d-md-flex justify-content-between">
                                    <div className="order-info-desktop">
                                        <div className="left d-flex align-items-center">
                                            <p>
                                                {i18next.t("inventoryList.tbheader.status")}: <span>
                                                {
                                                    stCurrentPackage
                                                        ? <GSTrans t={`page.affiliate.status.${stStatus}`}/>
                                                        : 'N/A'
                                                }
                                                </span>
                                            </p>
                                            {
                                                stCurrentPackage && <UikToggle
                                                    checked={stStatus === STATUS.ACTIVE}
                                                    className="m-0 p-0"
                                                    disabled={true}
                                                />
                                            }
                                        </div>
                                        <div className="right d-flex align-items-center">
                                            <div className='d-flex flex-column'>
                                                <span>
                                                    <GSTrans t="page.affiliate.status.purchasedPackage"
                                                             values={ { number: stCurrentStoreAffiliate?.numberOfService || 0 } }/>
                                                </span>
                                                <p>
                                                    {i18next.t("page.shopee.expiryDate.column.title")}: <span>
                                                {
                                                    stCurrentStoreAffiliate
                                                        ? moment(stCurrentStoreAffiliate.expiryTime).format('DD/MM/YYYY')
                                                        : 'N/A'
                                                }
                                                </span>
                                                    {
                                                        isCurrentTabExpired() && <span className='color-red'>
                                                        &nbsp;(<GSTrans t={`page.affiliate.status.EXPIRED`}/>)
                                                    </span>
                                                    }
                                                </p>
                                            </div>
                                            <GSComponentTooltip
                                                placement={GSComponentTooltipPlacement.BOTTOM}
                                                interactive
                                                html={
                                                    <div>{i18n.t(`${
                                                        stCurrentPackage? 
                                                        'page.affiliate.info.upgrade.tooltip'
                                                        :stTabActive === Constants.AFFILIATE_SERVICE_TYPE.DROP_SHIP?
                                                        'page.affiliate.info.buynow.dropship.tooltip'
                                                        :'page.affiliate.info.buynow.reseller.tooltip'}`)}</div>
                                                }
                                            >
                                                <GSButton success className="btn-save" 
                                                    onClick={handleUpgradeOrRenew}>
                                                    <GSTrans t={
                                                        !stCurrentPackage
                                                            ? 'page.affiliate.button.buyNow'
                                                            : isCurrentTabExpired()
                                                            ? 'page.affiliate.button.renew'
                                                            : 'page.affiliate.button.upgrade'
                                                    }/>
                                                </GSButton>
                                            </GSComponentTooltip>
                                        </div>
                                    </div>
                                    <div className="order-info-mobile">
                                        <div className="order-row">
                                            <p>
                                                {i18next.t("inventoryList.tbheader.status")}
                                            </p>
                                            <p>
                                                {
                                                    stCurrentPackage
                                                    ? <GSTrans t={`page.affiliate.status.${stStatus}`}/>
                                                    : 'N/A'
                                                }
                                            </p>
                                            <p>
                                                {
                                                    stCurrentPackage && <UikToggle
                                                        checked={stStatus === STATUS.ACTIVE}
                                                        className="m-0 p-0"
                                                        disabled={true}
                                                    />
                                                }
                                                
                                            </p>
                                        </div>
                                        <div className="order-row">
                                            <p>
                                                {i18next.t("page.shopee.expiryDate.column.title")}
                                            </p>
                                            <p>
                                            {
                                                stCurrentStoreAffiliate
                                                    ? moment(stCurrentStoreAffiliate.expiryTime).format('DD/MM/YYYY')
                                                    : 'N/A'
                                            }
                                            </p>
                                            <p>
                                                {
                                                    isCurrentTabExpired() && <span className='color-red'>
                                                    &nbsp;(<GSTrans t={`page.affiliate.status.EXPIRED`}/>)
                                                </span>
                                                }
                                            </p>
                                            <GSComponentTooltip
                                                placement={GSComponentTooltipPlacement.BOTTOM}
                                                interactive
                                                html={
                                                    <div>{i18n.t(`${
                                                        stCurrentPackage? 
                                                        'page.affiliate.info.upgrade.tooltip'
                                                        :stTabActive === Constants.AFFILIATE_SERVICE_TYPE.DROP_SHIP?
                                                        'page.affiliate.info.buynow.dropship.tooltip'
                                                        :'page.affiliate.info.buynow.reseller.tooltip'}`)}</div>
                                                }
                                            >
                                                <GSButton success className="btn-save" 
                                                    onClick={handleUpgradeOrRenew}>
                                                    <GSTrans t={
                                                        !stCurrentPackage
                                                            ? 'page.affiliate.button.buyNow'
                                                            : isCurrentTabExpired()
                                                            ? 'page.affiliate.button.renew'
                                                            : 'page.affiliate.button.upgrade'
                                                    }/>
                                                </GSButton>
                                            </GSComponentTooltip>
                                        </div>
                                    </div>
                                </UikWidgetContent>
                            </UikWidget>
                        </div>
                        {
                            !stCurrentPackage
                                ? <UikWidget className="gs-widget mt-0">
                                    <UikWidgetContent
                                        className="gs-widget__content no-purchase d-flex flex-column justify-content-center align-items-center">
                                        <GSImg src='/assets/images/affiliate/icon_no_purchase.svg' alt="empty-icon"
                                               width={39} height={39}/>
                                        <span className='text'><GSTrans t='page.affiliate.info.noPurchase'/></span>
                                    </UikWidgetContent>
                                </UikWidget>
                                : <>
                                    <UikWidget className="gs-widget mt-0">
                                        <UikWidgetHeader className="gs-widget__header">
                                            <Trans i18nKey="page.affiliate.commission.partners.type"/>
                                        </UikWidgetHeader>
                                        <UikWidgetContent
                                            className="row">
                                            <div className="box col-md-3 col-6">
                                                <div className="box__container">
                                                    <div className="img img1">
                                                    </div>
                                                    <p>
                                                        {i18next.t("page.affiliate.info.totalPartner")}
                                                    </p>
                                                    <p className="number">{NumberUtils.formatThousandFixed(stPartnerInfo.totalPartner, stDefaultPrecision)}</p>
                                                </div>
                                            </div>
                                            <div className="box col-md-3 col-6">
                                                <div className="box__container">
                                                    <div className="img img2">
                                                    </div>
                                                    <p>
                                                        {i18next.t("page.affiliate.info.activatedPartner")}
                                                    </p>
                                                    <p className="number">{NumberUtils.formatThousandFixed(stPartnerInfo.activePartner, stDefaultPrecision)}</p>
                                                </div>
                                            </div>
                                            <div className="box col-md-3 col-6">
                                                <div className="box__container">
                                                    <div className="img img3">
                                                    </div>
                                                    <p>
                                                        {i18next.t("page.affiliate.info.pendingPartner")}
                                                    </p>
                                                    <p className="number">{NumberUtils.formatThousandFixed(stPartnerInfo.pendingPartner, stDefaultPrecision)}</p>
                                                </div>
                                            </div>
                                            <div className="box col-md-3 col-6">
                                                <div className="box__container">
                                                    <div className="img img4">
                                                    </div>
                                                    <p>
                                                        {i18next.t("page.affiliate.info.deactivatedPartner")}
                                                    </p>
                                                    <p className="number">{NumberUtils.formatThousandFixed(stPartnerInfo.deactivatePartner, stDefaultPrecision)}</p>
                                                </div>
                                            </div>
                                        </UikWidgetContent>
                                    </UikWidget>
                                    <UikWidget className="gs-widget mt-0">
                                        <UikWidgetHeader className="gs-widget__header">
                                            <Trans i18nKey="page.affiliate.commission.partners.type.order"/>
                                        </UikWidgetHeader>
                                        <UikWidgetContent
                                            className="row">
                                            <div className="box col-md-3 col-6">
                                                <div className="box__container">
                                                    <div className="img img5">
                                                    </div>
                                                    <p>
                                                        {i18next.t("page.affiliate.info.Orders")}
                                                    </p>
                                                    <p className="number">{NumberUtils.formatThousandFixed(stPartnerOrderInfo.totalOrder, stDefaultPrecision)}</p>
                                                </div>
                                            </div>
                                            <div className="box col-md-3 col-6">
                                                <div className="box__container">
                                                    <div className="img img6">
                                                    </div>
                                                    <p>
                                                        {i18next.t("page.affiliate.info.approvedOrders")}
                                                    </p>
                                                    <p className="number">{NumberUtils.formatThousandFixed(stPartnerOrderInfo.approvedOrder, stDefaultPrecision)}</p>
                                                </div>
                                            </div>
                                            <div className="box col-md-3 col-6">
                                                <div className="box__container">
                                                    <div className="img img7">
                                                    </div>
                                                    <p>
                                                        {i18next.t("page.affiliate.info.pendingOrder")}
                                                    </p>
                                                    <p className="number">{NumberUtils.formatThousandFixed(stPartnerOrderInfo.pendingOrder, stDefaultPrecision)}</p>
                                                </div>
                                            </div>
                                            <div className="box col-md-3 col-6"></div>
                                        </UikWidgetContent>
                                    </UikWidget>
                                    <UikWidget className="gs-widget mt-0">
                                        <UikWidgetHeader className="gs-widget__header">
                                            <Trans i18nKey="page.affiliate.commission.partners.type.commission"/>
                                        </UikWidgetHeader>
                                        <UikWidgetContent className="row">
                                            <div className="row col-12 p-0">
                                                <div className="box col-md-3 col-6">
                                                    <div className="box__container">
                                                        <div className="img img8">
                                                        </div>
                                                        <p>
                                                            {i18next.t("page.affiliate.info.revenue")}
                                                        </p>
                                                        <p className="number">{NumberUtils.formatThousandFixed(stPartnerCommissionInfo.totalRevenue, stDefaultPrecision)}</p>
                                                    </div>
                                                </div>
                                                <div className="box col-md-3 col-6">
                                                    <div className="box__container">
                                                        <div className="img img9">
                                                        </div>
                                                        <p>
                                                            {i18next.t("page.affiliate.info.approvedCommission")}
                                                        </p>
                                                        <p className="number">{NumberUtils.formatThousandFixed(stPartnerCommissionInfo.approvedCommissionAmount, stDefaultPrecision)}</p>
                                                    </div>
                                                </div>
                                                <div className="box col-md-3 col-6">
                                                    <div className="box__container">
                                                        <div className="img img10">
                                                        </div>
                                                        <p>
                                                            {i18next.t("page.affiliate.info.rejectedCommission")}
                                                        </p>
                                                        <p className="number">
                                                            {NumberUtils.formatThousandFixed(stPartnerCommissionInfo.rejectCommissionAmount, stDefaultPrecision)}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="box col-md-3 col-6">
                                                    <div className="box__container">
                                                        <div className="img img11">
                                                        </div>
                                                        <p>
                                                            {i18next.t("page.affiliate.info.pendingCommission")}
                                                        </p>
                                                        <p className="number">
                                                            {NumberUtils.formatThousandFixed(stPartnerCommissionInfo.pendingCommissionAmount, stDefaultPrecision)}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="box col-md-3 col-6">
                                                    <div className="box__container">
                                                        <div className="img img12">
                                                        </div>
                                                        <p>
                                                            {i18next.t("page.affiliate.info.paidCommission")}
                                                        </p>
                                                        <p className="number">
                                                            {NumberUtils.formatThousandFixed(stPartnerCommissionInfo.paidCommissionAmount, stDefaultPrecision)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </UikWidgetContent>
                                    </UikWidget>
                                </>
                        }
                    </div>
                </GSContentBody>
                <GSContentFooter className='mt-auto'>
                    <GSLearnMoreFooter
                        text={i18next.t("page.affiliate.intro.affiliate")}
                        linkTo={Constants.UrlRefs.LEARN_MORE_AFFILIATE}
                    />
                </GSContentFooter>
            </GSContentContainer>
        </>
    )
}

export default AffiliateInfo;
