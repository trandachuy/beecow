import React, {useEffect, useRef, useState} from 'react';
import "./multipleCurrency.sass";
import GSContentContainer from "../../../components/layout/contentContainer/GSContentContainer";
import GSWidget from "../../../components/shared/form/GSWidget/GSWidget";
import {UikToggle, UikWidgetHeader} from "../../../@uik";
import PrivateComponent from "../../../components/shared/PrivateComponent/PrivateComponent";
import GSWidgetContent from "../../../components/shared/form/GSWidget/GSWidgetContent";
import {AvField, AvForm} from "availity-reactstrap-validation";
import i18next from "i18next";
import {FormValidate} from "../../../config/form-validate";
import GSButton from "../../../components/shared/GSButton/GSButton";
import GSTrans from "../../../components/shared/GSTrans/GSTrans";
import GSComponentTooltip, {GSComponentTooltipPlacement} from "../../../components/shared/GSComponentTooltip/GSComponentTooltip";
import storeService from "../../../services/StoreService";
import {CurrencyUtils} from "../../../utils/number-format";
import {GSToast} from "../../../utils/gs-toast";
import {CredentialUtils} from "../../../utils/credential";
import * as accounting from "accounting-js";

const MultipleCurrency = props => {
    const refSaveForm = useRef(null)

    const [stToggleBoool,setStToggleBoool] = useState(false)
    const [stCurrencyRateData,setStCurrencyRateData] = useState([])
    const [stCurrencyCodeList,setStCurrencyCodeList] = useState([])
    const [stRateCurrencyStore, setStRateCurrencyStore] = useState(null)
    const [exchangeRateTooltip, setExchangeRateTooltip] = useState("")

    useEffect(() => {
        fetchMultipleCurrencyPaypal()
    }, [])

    const fetchMultipleCurrencyPaypal = () => {
        storeService.getMultipleCurrency()
            .then((result) => {
                setStCurrencyCodeList(result.codes)
                setStCurrencyRateData(result)
                setStToggleBoool(result.enabled)
                const storeCurrency = result.rateList.find(rate => rate.code === CredentialUtils.getCurrencyCode())
                const usdCurrency = result.rateList.find(rate => rate.code === 'USD')
                setStRateCurrencyStore(storeCurrency)
                const opt = {
                    symbol: '',
                    thousand: ',',
                    precision: 6,
                }
                if (CredentialUtils.getCurrencyCode() === 'VND') {
                    opt.precision = 0
                }
                setExchangeRateTooltip(accounting.formatMoney(usdCurrency.exchangeRate, opt))
            })
            .catch(() => {})
    }
    
    const toggleOnOrOff = (e) => {
        const checked = e.target.checked

        const dataRequest = {
            enabled: checked,
            id: stCurrencyRateData.id, // not required, if has no id, just leave it null
            selfRateUsd: stCurrencyRateData.selfRateUsd, // not required, if has no selfRateUsd, just leave it null
            storeId: +(CredentialUtils.getStoreId()),
            codes: stCurrencyRateData.codes ? stCurrencyRateData.codes : [] // only send enabled currency codes
        }
        storeService.updateMultipleCurrency(dataRequest)
            .then(() => {
                fetchMultipleCurrencyPaypal()
                setStToggleBoool(checked)
            })
            .catch(() => GSToast.commonError())
    }
    
    const handleSubmitSave = (event, value) =>{
        const dataRequest = {
            enabled: stCurrencyRateData.enabled,
            id: stCurrencyRateData.id, // not required, if has no id, just leave it null
            selfRateUsd: stCurrencyRateData.selfRateUsd, // not required, if has no selfRateUsd, just leave it null
            storeId: stCurrencyRateData.storeId,
            codes: stCurrencyCodeList // only send enabled currency codes
        }
        storeService.updateMultipleCurrency(dataRequest)
            .then(() => {
                fetchMultipleCurrencyPaypal()
                GSToast.success("toast.update.success", true);
            })
            .catch(() => GSToast.commonError())
        
    }
    
    const handleIsCurrency = (e, code)=>{
        if (e.currentTarget.checked){
            return setStCurrencyCodeList([...stCurrencyCodeList,code])
        }else {
            let deleteCode = stCurrencyCodeList.filter(deleteCode=>deleteCode != code)
            setStCurrencyCodeList(deleteCode)
            return 
        }
    }
    
    
    return (
        <GSContentContainer className="multiple-currency">
            <GSWidget>
                <UikWidgetHeader className="gs-widget__header">
                    <div>
                        <h2>
                            {i18next.t('page.onlineshop.preference.multipleCurrency')} 
                        </h2>
                        <PrivateComponent>
                            <UikToggle
                                className="checkout-information__toggle"
                                checked={stToggleBoool}
                                onChange={(e) => toggleOnOrOff(e)}
                            />
                        </PrivateComponent>
                    </div>
                    <p>
                        {i18next.t('page.onlineshop.preference.multipleCurrency.content')}
                    </p>
                </UikWidgetHeader>
                {stToggleBoool &&

                <GSWidgetContent>
                    <AvForm ref={refSaveForm} onValidSubmit={handleSubmitSave} autoComplete="off" className="w-100">
                        <div className="multiple-currency__body">
                            <table>
                                <thead>
                                <tr>
                                    <th>{i18next.t('page.onlineshop.preference.multipleCurrency.currency')}</th>
                                    <th>
                                        {i18next.t('page.onlineshop.preference.multipleCurrency.exchangeRate')}
                                        <GSComponentTooltip
                                            placement={GSComponentTooltipPlacement.BOTTOM}
                                            interactive
                                            style={{
                                                display: 'inline'
                                            }}
                                            html={

                                                <GSTrans i18nKey={'page.onlineshop.preference.multipleCurrency.tooltip'} values={{value: exchangeRateTooltip, currencyCode: stRateCurrencyStore?.code}}/>
                                            }>
                                            <span>?</span>
                                        </GSComponentTooltip>
                                    </th>
                                    <th style={{width:"130px"}}></th>
                                </tr>
                                </thead>
                                <tbody>
                                {stCurrencyRateData?.rateList?.map((currency,index) => {
                                   if (stRateCurrencyStore !== null && currency.code !== stRateCurrencyStore.code) {
                                       return(
                                           <tr key={index}>
                                               <td>{currency.code} - {currency.currency}</td>
                                               <td>
                                                   <p className="exchange-rate m-0">
                                                       {CurrencyUtils.formatMoneyByCurrencyWithPrecision(currency.exchangeRate, stRateCurrencyStore.symbol, 6)}
                                                   </p>
                                               </td>
                                               <td style={{width:"130px"}}>
                                                   <UikToggle
                                                       checked={currency.code === stCurrencyCodeList?.find(code=> code === currency.code)}
                                                       className="checkout-information__toggle"
                                                       onClick={(e) => handleIsCurrency(e,currency.code)}
                                                   />
                                               </td>
                                           </tr>
                                       )
                                   }
                                })}
                                
                                </tbody>
                            </table>
                        </div>
                    </AvForm>

                    <div className="mt-3">
                        <GSButton primary
                        onClick={(e)=>{
                            e.preventDefault()
                            refSaveForm.current.submit()
                        }}
                        >
                            <GSTrans t="common.btn.save"/>
                        </GSButton>
                    </div>
                </GSWidgetContent>
                }
            </GSWidget>
        </GSContentContainer>

    );
};

MultipleCurrency.propTypes = {};

export default MultipleCurrency;

