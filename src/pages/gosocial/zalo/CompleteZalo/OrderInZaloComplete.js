import React, { forwardRef, useContext, useEffect, useImperativeHandle, useRef, useState } from "react";
import GSWidget from "../../../../components/shared/form/GSWidget/GSWidget";
import GSWidgetContent from "../../../../components/shared/form/GSWidget/GSWidgetContent";
import GSTrans from "../../../../components/shared/GSTrans/GSTrans";
import {CurrencyUtils, NumberUtils} from "../../../../utils/number-format";
import './OrderInZaloComplete.sass';
import LoadingScreen from "../../../../components/shared/LoadingScreen/LoadingScreen";
import AlertModal from "../../../../components/shared/AlertModal/AlertModal";
import i18next from "../../../../config/i18n";
import storeService from '../../../../services/StoreService';
import catalogService from '../../../../services/CatalogService';
import {cancelablePromise} from '../../../../utils/promise';
import {useRecoilValue} from "recoil";
import ZaloDiscountModal from "./ZaloDiscountModal";
import ZaloShippingModal from "./ZaloShippingModal";
import {OrderInZaloContext} from "../context/OrderInZaloContext";
import {OrderInZaloContextService} from "../context/OrderInZaloContextService";
import {OrderInZaloRecoil} from "../recoil/OrderInZaloRecoil";

const defaultDeliveryServiceId = 14

const OrderInZaloComplete = forwardRef((props, ref) => {
    const currency = CurrencyUtils.getLocalStorageSymbol()
    const { state, dispatch } = useContext(OrderInZaloContext.context);
    const [stIsSaving, setStIsSaving] = useState(false);
    const refShowConfirm = useRef(null);
    const storeBranch = useRecoilValue(OrderInZaloRecoil.storeBranchState)

    useImperativeHandle(ref, () => ({ getTotalPrice }));

    useEffect(() => {
        if (!state.storeBranch) {
            return
        }
        findPickUpAddress();
    }, [state.storeBranch]);

    // total,payment change -> reset received amount
    useEffect(() => {
        const total = OrderInZaloContextService.calculateTotalPrice(state.productList, state.shippingInfo, state.promotion, state.membership, state.totalVATAmount, state.pointAmount, state.discountInfo)
        dispatch(OrderInZaloContext.actions.setReceivedAmount(total))
    }, [state.productList, state.shippingInfo, state.promotion, state.membership, state.totalVATAmount, state.pointAmount, state.paymentMethod, state.discountInfo]);

    useEffect(() => {
        let subTotal = OrderInZaloContextService.calculateSubTotalPrice(state.productList)
        if(props.subTotalPrice) props.subTotalPrice(subTotal)
    }, [state.productList])

    const findPickUpAddress = () => {
        const DEFAULT_COUNTRY_CODE = "VN";
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

                const pmCities = cancelablePromise(catalogService.getCitesOfCountry(DEFAULT_COUNTRY_CODE))
                const locale = i18next.language === 'vi' ? 'inCountry' : 'outCountry'

                return pmCities.promise
                    .then(cities => {
                        const city = cities.find(city => city.code === cityCode);
                        const pmDistricts = cancelablePromise(catalogService.getDistrictsOfCity(cityCode));

                        return pmDistricts.promise
                            .then(districts => {
                                if (!districtCode) {
                                    return [storeBranch.address + ', ' + city[locale], storeBranchPhone]
                                }

                                const district = districts.find(district => district.code === districtCode);
                                const pmWards = cancelablePromise(catalogService.getWardsOfDistrict(districtCode));

                                return pmWards.promise
                                    .then(wards => {
                                        if (!wardCode) {
                                            return [storeBranch.address + ', ' + district[locale] + ', ', city[locale], storeBranchPhone]
                                        }

                                        const ward = wards.find(ward => ward.code === wardCode)

                                        return [storeBranch.address + ", " + ward[locale] + ", " + district[locale] + ", " + city[locale], storeBranchPhone]
                                    });
                            });
                    })
            })
            .then(([fullAddress, storeBranchPhone]) => {
                dispatch(OrderInZaloContext.actions.setStoreInfo({
                    storeAddress: fullAddress,
                    storePhone: storeBranchPhone
                }))
            });
    }
    
    
    const getTotalPrice = () => {
        return OrderInZaloContextService.calculateTotalPrice(state.productList, state.shippingInfo, state.promotion, state.membership, state.totalVATAmount, state.pointAmount, state.discountInfo)
    }

    const getTotalDiscount = () => {
        return OrderInZaloContextService.calculateDiscountAmount(state.productList, state.discountInfo)
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
                                        OrderInZaloContextService.countProductList(state.productList)
                                    )
                                }} />
                            </span>
                        </div>

                        <span className="align-self-baseline">
                            {CurrencyUtils.formatMoneyByCurrency(
                                OrderInZaloContextService.calculateSubTotalPrice(state.productList),
                                CurrencyUtils.getLocalStorageSymbol()
                            )}
                        </span>
                    </div>
                    {/*VAT*/}
                    <div className="text d-flex justify-content-between align-items-center mb-2">
                        <span>VAT</span>
                        <span>
                            {handleDisplayFormatDigits(OrderInZaloContextService.calculateVAT(state.totalVATAmount))}
                        </span>
                    </div>
                    <div className="text d-flex justify-content-between align-items-center mb-2">
                        <span>
                            <ZaloDiscountModal/>
                        </span>
                        <span>
                            {handleDisplayFormatDigits(getTotalDiscount())}
                        </span>
                    </div>
                    <div className="text d-flex justify-content-between align-items-center mb-2">
                        {props.shippingCodeSelectedId !== defaultDeliveryServiceId ? 
                            <span className='disable-link not-allowed'>
                                <GSTrans t='page.gochat.facebook.conversations.Shipping'/>
                            </span>: <ZaloShippingModal/>
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

OrderInZaloComplete.propTypes = {};

export default OrderInZaloComplete;
