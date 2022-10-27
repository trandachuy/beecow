/*
 * ******************************************************************************
 *  * Copyright 2017 (C) MediaStep Software Inc.
 *  *
 *  * Created on : 19/05/2020
 *  * Author: Minh Tran <minh.tran@mediastep.com>
 *  ******************************************************************************
 */

import React, {useContext, useState} from 'react'
import GSTrans from "../../../../../components/shared/GSTrans/GSTrans";
import GSImg from "../../../../../components/shared/GSImg/GSImg";
import {CurrencyUtils, NumberUtils} from "../../../../../utils/number-format";
import {OrderInStorePurchaseContextService} from "../../context/OrderInStorePurchaseContextService";
import {CurrencySymbol} from "../../../../../components/shared/form/CryStrapInput/CryStrapInput";
import OrderInstoreDiscountModal from "./OrderInstoreDiscountModal";
import {OrderInStorePurchaseContext} from "../../context/OrderInStorePurchaseContext";
import {CouponTypeEnum} from "../../../../../models/CouponTypeEnum";
import i18next from "i18next";
import GSTooltip from "../../../../../components/shared/GSTooltip/GSTooltip";
import GSComponentTooltip, {GSComponentTooltipPlacement} from "../../../../../components/shared/GSComponentTooltip/GSComponentTooltip";
import Constants from "../../../../../config/Constant";

const OrderInstoreDiscount = (props) => {
    const currency = CurrencyUtils.getLocalStorageSymbol()
    const {state} = useContext(OrderInStorePurchaseContext.context)
    const [stDiscountToggle, setStDiscountToggle] = useState(false)

    const getMembershipHtml = () => {
        return (
            state.membership && <span>
                <span>
                    <GSTrans t={"page.order.instorePurchase.membershipDiscountWithoutMax"}
                             values={{
                                 membershipName: state.membership.name,
                                 percent: state.membership.discountPercent
                             }}
                    >
                        <strong>a</strong> - Discount percent%
                    </GSTrans>
                </span>
                &nbsp;
                {
                    state.membership.discountMaxAmount &&
                    <span>
                        <GSTrans t={"page.order.instorePurchase.membershipDiscountMax"}
                                 values={{
                                     maxAmount: CurrencyUtils.formatMoneyByCurrency(state.membership.discountMaxAmount, 'VND')
                                 }}
                        />
                    </span>
                }
            </span>
        )
    }

    const getPromotionHtml = () => {
        return (
            state.promotion && state.promotion.couponType == CouponTypeEnum.FREE_SHIPPING &&
            <span>
                <span>
                    <GSTrans t='page.order.instorePurchase.freeShip' values={{
                        shippingProviders: OrderInstoreDiscount.resolveShippingProvider(state.promotion.freeShippingProvider),
                    }}/>
                </span>
                &nbsp;
                {
                    state.promotion.feeShippingValue &&
                    <span>
                        <GSTrans t={"page.order.instorePurchase.freeShipMax"} values={{
                            maxAmount: CurrencyUtils.formatMoneyByCurrency(state.promotion.feeShippingValue, CurrencyUtils.getLocalStorageSymbol())
                        }}/>
                    </span>
                }
            </span>
        )
    }

    const handleDisplayFormatDiscountAMount = () => {
        let number = OrderInStorePurchaseContextService.calculateDiscountAmount(state.productList, state.promotion, state.membership, state.discountOption)

        number += state.isUsedDelivery
                    ? state.shippingInfo.selfDeliveryFee - OrderInStorePurchaseContextService.calculateShippingFee(state.shippingInfo, state.promotion)
                    : 0

        let decimal = 0
        let precision = 0

        if (CurrencyUtils.isCurrencyInput(currency)) {
            decimal = 6
            precision = 2
        }

        number = NumberUtils.formatThousandFixed(number, decimal, true)

        if (number.indexOf('.') > 0) {
            precision = String(number).split('.')[1]?.length

            if (precision < 3) {
                precision = 2
            } else if (precision > 6) {
                precision = 6
            }
        }
        return CurrencyUtils.formatMoneyByCurrencyWithPrecision(number, currency, precision)
    }

    return (
        <>
            {/*DISCOUNT MODAL*/}
            <OrderInstoreDiscountModal toggle={stDiscountToggle} onClose={() => setStDiscountToggle(false)}/>

            <div className={[
                "d-flex justify-content-between align-items-center mb-3",
                state.productList?.length ? '' : 'disabled'
            ].join(' ')}>
                <span className="color-blue gsa-hover--fadeOut cursor--pointer">
                    <span onClick={() => {
                        setStDiscountToggle(true)
                    }}>
                        <GSTrans t={"page.order.detail.items.discount"}/>
                    </span>
                    {
                        !state.promotion && !state.discountOption.discount && state.membership &&
                        <GSComponentTooltip
                            html={getMembershipHtml()}
                            theme={GSTooltip.THEME.DARK}
                            placement={GSComponentTooltipPlacement.BOTTOM}
                        >
                            <GSImg className='ml-2' src="/assets/images/membership-discount.svg"
                                   width={20}
                                   alt="membership"/>
                        </GSComponentTooltip>
                    }

                    {
                        state.promotion && state.promotion.couponType == CouponTypeEnum.FREE_SHIPPING &&
                        <GSComponentTooltip
                            html={getPromotionHtml()}
                            theme={GSTooltip.THEME.DARK}
                            placement={GSComponentTooltipPlacement.BOTTOM}
                            style={{
                                display: 'inline'
                            }}
                        >
                            <GSImg className='ml-2' src="/assets/images/freeship.png" width={20} alt="promotion"/>
                        </GSComponentTooltip>
                    }
                </span>
                <span>
                    {'-'}
                    {handleDisplayFormatDiscountAMount()}
                </span>
            </div>
        </>
    )
}

OrderInstoreDiscount.resolveShippingProvider = (shippingProviderList) => {
    const result = shippingProviderList.map(spName => {
        switch (spName) {
            case Constants.LogisticCode.Common.GIAO_HANG_NHANH:
                return 'GHN'
            case Constants.LogisticCode.Common.GIAO_HANG_TIET_KIEM:
                return 'GHTK'
            case Constants.LogisticCode.Common.AHAMOVE:
            case Constants.LogisticCode.Common.AHAMOVE_TRUCK:
                return 'AHM'
            // case Constants.LogisticCode.Common.VNPOST:
            //     return 'VNPOST'
            case Constants.LogisticCode.Common.SELF_DELIVERY:
                return i18next.t('page.setting.shippingAndPayment.selfDelivery')
            default:
                return spName
        }
    })
    return result.join(', ')
}

export default OrderInstoreDiscount
