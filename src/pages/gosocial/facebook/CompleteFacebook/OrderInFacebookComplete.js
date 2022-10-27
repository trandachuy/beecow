import React, { forwardRef, useContext, useEffect, useImperativeHandle, useRef, useState } from "react";
import GSWidget from '../../../../components/shared/form/GSWidget/GSWidget';
import GSWidgetContent from '../../../../components/shared/form/GSWidget/GSWidgetContent';
import GSTrans from '../../../../components/shared/GSTrans/GSTrans';
import {CurrencyUtils, NumberUtils} from '../../../../utils/number-format';
import './OrderInFacebookComplete.sass';
import LoadingScreen from '../../../../components/shared/LoadingScreen/LoadingScreen';
import AlertModal from '../../../../components/shared/AlertModal/AlertModal';
import storeService from '../../../../services/StoreService';
import {cancelablePromise} from '../../../../utils/promise';
import {useRecoilValue} from 'recoil';
import FacebookDiscountModal from './FacebookDiscountModal';
import FacebookShippingModal from './FacebookShippingModal';
import {FbMessengerContext} from '../context/FbMessengerContext';
import {OrderInFacebookContextService} from '../context/OrderInFacebookContextService';
import {AddressUtils} from '../../../../utils/address-utils'
import {OrderInFacebookRecoil} from "../recoil/OrderInFacebookRecoil";

const FACEBOOK_DISCOUNT_TYPE = {
    VALUE: 'VALUE', PERCENTAGE: 'PERCENTAGE'
}
const defaultDeliveryServiceId = 14

const OrderInFacebookComplete = forwardRef((props, ref) => {
    const currency = CurrencyUtils.getLocalStorageSymbol()
    const { state, dispatch } = useContext(FbMessengerContext.context);
    const [stIsSaving, setStIsSaving] = useState(false);
    const refShowConfirm = useRef(null);
    const storeBranch = useRecoilValue(OrderInFacebookRecoil.storeBranchState)

    useImperativeHandle(ref, () => ({ getTotalPrice }));
    
    useEffect(() => {
        if (!state.storeBranch) {
            return
        }
        findPickUpAddress();
    }, [state.storeBranch]);

    // total,payment change -> reset received amount
    useEffect(() => {
        const total = OrderInFacebookContextService.calculateTotalPrice(state.productList, state.shippingInfo, state.promotion, state.membership, state.totalVATAmount, state.pointAmount, state.discountInfo)
        dispatch(FbMessengerContext.actions.setReceivedAmount(total))
    }, [state.productList, state.shippingInfo, state.promotion, state.membership, state.totalVATAmount, state.pointAmount, state.paymentMethod, state.discountInfo]);

    useEffect(() => {
        let subTotal = OrderInFacebookContextService.calculateSubTotalPrice(state.productList)
        if(props.subTotalPrice) props.subTotalPrice(subTotal)
    }, [state.productList])

    const findPickUpAddress = () => {
        const branchId = storeBranch.value
        const pmStoreBranch = storeService.getStoreBranchById(branchId);
        const pmStoreInfo = cancelablePromise(pmStoreBranch);

        pmStoreInfo.promise
            .then(storeBranch => {
                const cityCode = storeBranch.city
                const districtCode = storeBranch.district
                const wardCode = storeBranch.ward
                const storeBranchPhone = storeBranch.phoneNumberFirst

                if (!cityCode) {
                    return [storeBranch.address, storeBranchPhone]
                }

                return [
                    AddressUtils.buildAddress(storeBranch.address, districtCode, wardCode, cityCode),
                    storeBranchPhone
                ]
            })
            .then(([fullAddress, storeBranchPhone]) => {
                dispatch(FbMessengerContext.actions.setStoreInfo({
                    storeAddress: fullAddress,
                    storePhone: storeBranchPhone
                }))
            });
    }
    
    const getTotalPrice = () => {
        return OrderInFacebookContextService.calculateTotalPrice(state.productList, state.shippingInfo, state.promotion, state.membership, state.totalVATAmount, state.pointAmount, state.discountInfo)
    }

    const getTotalDiscount = () => {
        return OrderInFacebookContextService.calculateDiscountAmount(state.productList, state.discountInfo)
    }

    const handleDisplayFormatDigits = (number) => {
        let decimal = 0
        let precision = 0
        if(CurrencyUtils.isCurrencyInput(currency)){
            decimal = '6'
            precision = 2
        }
        number = NumberUtils.formatThousandFixed(number, decimal, true)
        if(number.indexOf('.') > 0){
            precision = String(number).split('.')[1]?.length
            if(precision < 3){
                precision = 2
            }else {
                if(precision > 6) precision = 6
            }
        }
        return CurrencyUtils.formatMoneyByCurrencyWithPrecision(number, currency, precision)
    }

    return (
        <>
            {stIsSaving && <LoadingScreen zIndex={1051} />}
            <GSWidget className="order-in-facebook-complete flex-grow-1">
                <GSWidgetContent className="summary d-flex flex-column font-size-1_1rem h-100">
                    {/*SUBTOTAL*/}
                    <div className="text d-flex justify-content-between align-items-center mb-2">
                        <div className="d-flex align-items-center">
                            <span>
                                <GSTrans t={"page.order.detail.items.subTotal"}/>
                            </span>
                            <span className="font-size-12px">
                                <GSTrans t={"page.instore.summary.productCount"} values={{
                                    x: NumberUtils.formatThousand(
                                        OrderInFacebookContextService.countProductList(state.productList)
                                        )
                                }} />
                            </span>
                        </div>
                        <span className="align-self-baseline">
                            {CurrencyUtils.formatMoneyByCurrency(
                                OrderInFacebookContextService.calculateSubTotalPrice(state.productList),
                                CurrencyUtils.getLocalStorageSymbol()
                            )}
                        </span>
                    </div>
                    {/*VAT*/}
                    <div className="text d-flex justify-content-between align-items-center mb-2">
                        <span>VAT</span>
                        <span>{handleDisplayFormatDigits(OrderInFacebookContextService.calculateVAT(state.totalVATAmount))}</span>
                    </div>
                    <div className="text d-flex justify-content-between align-items-center mb-2">
                        <span>
                            <FacebookDiscountModal/>
                        </span>
                        <span>{handleDisplayFormatDigits(getTotalDiscount())}</span>
                    </div>
                    <div className="text d-flex justify-content-between align-items-center mb-2">
                        {props.shippingCodeSelectedId !== defaultDeliveryServiceId ? 
                            <span className='disable-link not-allowed'>
                                <GSTrans t='page.gochat.facebook.conversations.Shipping'/>
                            </span>: <FacebookShippingModal/>
                        }
                        <span>
                            {CurrencyUtils.formatMoneyByCurrency(
                                state.shippingInfo.amount,
                                CurrencyUtils.getLocalStorageSymbol()
                            )}
                        </span>
                    </div>
                    
                    {/*TOTAL*/}
                    <div className="text-total d-flex justify-content-between align-items-center mb-2">
                        <span>
                            <GSTrans t="page.instore.summary.total" />
                        </span>
                        <span>
                            {CurrencyUtils.formatMoneyByCurrency(
                                getTotalPrice(),
                                CurrencyUtils.getLocalStorageSymbol()
                            )}
                        </span>
                    </div>
                </GSWidgetContent>
            </GSWidget>
            <AlertModal ref={refShowConfirm} />
        </>
    );
});

OrderInFacebookComplete.propTypes = {};

export default OrderInFacebookComplete;
