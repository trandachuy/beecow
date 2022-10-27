import React, {useContext, useEffect} from 'react';
import {OrderInStorePurchaseContext} from "../../context/OrderInStorePurchaseContext";
import GSTrans from "../../../../../components/shared/GSTrans/GSTrans";
import {CurrencyUtils, NumberUtils} from "../../../../../utils/number-format";
import {CurrencySymbol} from "../../../../../components/shared/form/CryStrapInput/CryStrapInput";
import {OrderInStorePurchaseContextService} from "../../context/OrderInStorePurchaseContextService";
import './OrderInStorePoint.sass';
import NumberFormat from "react-number-format";
import _ from 'lodash'
import {useRecoilValue} from "recoil";
import {OrderInStorePurchaseRecoil} from "../../recoil/OrderInStorePurchaseRecoil";

const OrderInStorePoint = (props) => {
    const {state, dispatch} = useContext(OrderInStorePurchaseContext.context);
    const loyaltySetting = useRecoilValue(OrderInStorePurchaseRecoil.loyaltySettingState)
    const storeBranch = useRecoilValue(OrderInStorePurchaseRecoil.storeBranchState)

    useEffect(() => {
        if (loyaltySetting.isUsePointEnabled) {
            const maxUsePoint = OrderInStorePurchaseContextService.calculateMaxUsePoint(state.productList, state.shippingInfo, state.promotion,
                state.membership, state.totalVATAmount,
                state.user.availablePoint, loyaltySetting.exchangeAmount);
            dispatch(OrderInStorePurchaseContext.actions.setMaxUsePoint(maxUsePoint));
            changeUsePoint(state.usePoint);
            calculateLoyaltyEarnPoint();
        } else {
            calculateLoyaltyEarnPoint();
        }
    }, [state.productList, state.shippingInfo, state.promotion, state.membership, state.totalVATAmount, state.user.userId,
        state.user.availablePoint, loyaltySetting.exchangeAmount]);

    useEffect(() => {
        calculateLoyaltyEarnPoint();
    }, [state.usePoint, state.maxUsePoint]);

    const calculateLoyaltyEarnPoint = () => {
        if (!_.isEmpty(state.productList)) {
            OrderInStorePurchaseContextService.calculateLoyaltyEarnPoint(state, dispatch, state.productList,
                state.user.userId, state.promotion?.couponCode, loyaltySetting, storeBranch);
        }
    }

    const changeUsePoint = (value) => {
        const pointAmount = isValidPoint(value) ? value * loyaltySetting.exchangeAmount : 0;
        dispatch(OrderInStorePurchaseContext.actions.setUsePoint(value));
        dispatch(OrderInStorePurchaseContext.actions.setPointAmount(pointAmount));
    };

    const isValidPoint = (value) => {
        if (value > state.maxUsePoint) {
            dispatch(OrderInStorePurchaseContext.actions.setErrorPointMessage("exceed"));
            return false;
        }
        dispatch(OrderInStorePurchaseContext.actions.setErrorPointMessage(""));
        return true;
    };


    return (
        <>
            {loyaltySetting.isUsePointEnabled && state.user.userId && !(state.user.guest > 0) &&
            <div className={"d-flex justify-content-between align-items-center mb-3 order-in-store-use-point"}>
            <span>
                <GSTrans t="page.reservation.detail.point"/>
            </span>
                <div className="d-flex flex-column align-items-end">
                    <NumberFormat
                        thousandSeparator={","}
                        precision={0}
                        value={state.usePoint}
                        className="clear-up-down-btn text-right order-pos__input-point"
                        max={state.user.availablePoint}
                        min={0}
                        onValueChange={(values) => changeUsePoint(values.floatValue)}
                    />
                    <span>
                    {'- '}{CurrencyUtils.formatMoneyByCurrency(state.pointAmount, CurrencyUtils.getLocalStorageSymbol())}
                </span>
                    {state.errorPointMessage === 'exceed' &&
                    <div className={"color-red font-size-12px mt-2"}>
                        <GSTrans t="page.order.create.cart.loyaltyPoint.max" values={{
                            point: NumberUtils.formatThousand(state.maxUsePoint)
                        }}
                        />
                    </div>
                    }
                </div>
            </div>
            }
        </>
    );
};

OrderInStorePoint.propTypes = {};

export default OrderInStorePoint;
