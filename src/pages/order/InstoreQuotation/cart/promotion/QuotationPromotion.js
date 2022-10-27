/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 15/01/2020
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React, {useContext, useEffect, useRef, useState} from 'react';
import './QuotationPromotion.sass';
import GSButton from "../../../../../components/shared/GSButton/GSButton";
import GSTrans from "../../../../../components/shared/GSTrans/GSTrans";
import {ContextQuotation} from "../../context/ContextQuotation";
import {UikTag} from '../../../../../@uik';
import GSActionButton, {GSActionButtonIcons} from "../../../../../components/shared/GSActionButton/GSActionButton";
import {BCOrderService} from "../../../../../services/BCOrderService";
import {GSToast} from "../../../../../utils/gs-toast";
import {QuotationInStoreRequestBuilder} from "../../QuotationInStoreRequestBuilder";
import {CurrencyUtils} from "../../../../../utils/number-format";
import {cn} from "../../../../../utils/class-name";
import {CouponTypeEnum} from "../../../../../models/CouponTypeEnum";
import Constants from "../../../../../config/Constant";
import i18next from "i18next";
import {ContextQuotationService} from "../../context/ContextQuotationService";
import {CurrencySymbol} from "../../../../../components/shared/form/CryStrapInput/CryStrapInput";

const QuotationPromotion = props => {
    const {state, dispatch} = useContext(ContextQuotation.context);
    const refPromotionCode = useRef(null);
    const [stIsShowApplyButton, setStIsShowApplyButton] = useState(false);

    useEffect(() => {
        ContextQuotationService.dispatchUpdateProductList(state, dispatch, state.productList)
    }, [state.user])

    const onClickApply = (e) => {
        if (!stIsShowApplyButton) {
            e.preventDefault()
            return
        }
        const promotionCode = refPromotionCode.current.value
        if (promotionCode) {
            BCOrderService.checkPromotionCode(state.productList.map(
                QuotationInStoreRequestBuilder.createPromotionItems
            ), promotionCode, state.user.userId)
                .then(result => {
                    refPromotionCode.current.value = ''
                    if (result.couponType !== CouponTypeEnum.FREE_SHIPPING) {
                        dispatch(ContextQuotation.actions.clearMembership())
                    }
                    dispatch(ContextQuotation.actions.applyPromotionCode(result))
                })
                .catch(e => {
                    if (e && e.response && e.response.data && e.response.data.message) {
                        GSToast.error(e.response.data.message);
                    } else {
                        GSToast.error("page.order.create.cart.promotionCode.invalid", true);
                    }
                    refPromotionCode.current.value = ''
                })
        }


    }

    const onClickClearPromotion = () => {
        dispatch(ContextQuotation.actions.clearPromotionCode())
        ContextQuotationService.dispatchUpdateProductList({...state, promotion: undefined, discountCode: false}, dispatch, state.productList)
        setStIsShowApplyButton(false)
    }

    const onChangeInputPromotion = (e) => {
        setStIsShowApplyButton(e.currentTarget.value !== '')
    }

    const resolveShippingProvider = (shippingProviderList) => {
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

    return (
        <form onClick={e => e.preventDefault()}
              className={cn("quotation-in-store-purchase-cart-promotion", {
                  'gs-atm--disable': state.productList.filter(p => p.checked).length === 0
              })}
        >
            <div className="d-flex flex-column align-items-end">
                <div>
                    <div className="d-flex justify-content-start align-items-center">
                        <img src="/assets/images/icon-discount-left-menu.svg" alt="promotion-code"/>
                        <h6 className="mb-0 ml-2">
                            <GSTrans t="page.order.create.cart.promotionCode"/>
                        </h6>
                        {!state.promotion &&
                        <input type="text"
                               className={["form-control ml-3"].join(' ')}
                               style={{maxWidth: '200px'}}
                               ref={refPromotionCode}
                               onChange={onChangeInputPromotion}
                        />
                        }
                        {state.promotion &&
                        <UikTag style={{width: '200px', height: '38px'}}
                                className="ml-3 font-size-14px"
                                color="green"
                        >
                            <div className="d-flex justify-content-between align-items-center w-100">
                                {state.promotion.couponCode}
                                <GSActionButton icon={GSActionButtonIcons.CLOSE}
                                                width="14px"
                                                onClick={onClickClearPromotion}
                                />
                            </div>

                        </UikTag>
                        }
                        <GSButton success
                                  className="ml-2"
                                  onClick={onClickApply}
                                  disabled={!!(!stIsShowApplyButton || state.promotion)}
                        >
                            <GSTrans t="component.order.date.range.apply"/>
                        </GSButton>
                    </div>

                    <div className="w-100 d-flex justify-content-start align-items-center">
                        <div>
                            {state.membership && state.membership.enabledBenefit && (!state.promotion || (state.promotion.couponType == CouponTypeEnum.FREE_SHIPPING)) &&
                            <div className="d-flex align-items-center justify-content-start membership__wrapper  mt-2">
                                <img src="/assets/images/membership-discount.svg" width="24px" className="mr-2" alt="membership"/>
                                <div>
                                    <strong>{state.membership.name}</strong>
                                    &nbsp;
                                    <GSTrans t={"page.order.instorePurchase.membershipDiscountWithoutMax"}
                                             values={{
                                                 membershipName: '', // => i18next's bug, don't pass membershipName into here
                                                 percent: state.membership.discountPercent
                                             }}
                                    >
                                        <strong>a</strong> - Discount percent%
                                    </GSTrans>
                                    {state.membership.discountMaxAmount &&
                                    <>
                                        <br/>
                                        <GSTrans t={"page.order.instorePurchase.membershipDiscountMax"}
                                                 values={{
                                                     maxAmount: CurrencyUtils.formatMoneyByCurrency(state.membership.discountMaxAmount, 'VND')
                                                 }}
                                        />
                                    </>
                                    }
                                </div>


                            </div>
                            }
                            {state.promotion && state.promotion.couponType == CouponTypeEnum.FREE_SHIPPING &&
                                <div className="d-flex align-items-center justify-content-start membership__wrapper  mt-2" style={{
                                    color: '#46c9af'
                                }}>
                                    <img src="/assets/images/freeship.png" width="24px" className="mr-2" alt="membership"/>
                                    <GSTrans t={"page.order.instorePurchase.freeShip"} values={{
                                        shippingProviders: resolveShippingProvider(state.promotion.freeShippingProvider),
                                    }}/>
                                    {state.promotion.feeShippingValue &&
                                        <>
                                            <br/>
                                            <GSTrans t={"page.order.instorePurchase.freeShipMax"} values={{
                                                maxAmount: CurrencyUtils.formatMoneyByCurrency(state.promotion.feeShippingValue, CurrencySymbol.VND)
                                            }}/>
                                        </>
                                    }
                                </div>

                            }
                        </div>

                    </div>
                </div>

            </div>

        </form>
    );
};

QuotationPromotion.propTypes = {

};

export default QuotationPromotion;
