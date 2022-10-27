import React from 'react';
import BarcodeReader from 'react-barcode-reader'
import GSActionButton, {GSActionButtonIcons} from "../../../../components/shared/GSActionButton/GSActionButton";
import i18next from "i18next";
import GSComponentTooltip, {GSComponentTooltipPlacement} from "../../../../components/shared/GSComponentTooltip/GSComponentTooltip";
import {useRecoilState} from "recoil";
import {OrderInStorePurchaseRecoil} from "../recoil/OrderInStorePurchaseRecoil";

export const BarCodeScanButton = ({handleScan,handleError})=>{
    const [posScannerState, setPosScannerState] = useRecoilState(OrderInStorePurchaseRecoil.posScannerState)

    const handleClick = () => {
        if(posScannerState.shouldScannerActivated) {
            setPosScannerState(state => ({
                ...state,
                scannerState: !state.scannerState
            }))
            if (posScannerState.customerScannerState) {
                setPosScannerState(state => ({
                    ...state,
                    customerScannerState: !state.customerScannerState
                }))
            }
        }
    }
    return (
        <>
            {posScannerState.scannerState && posScannerState.shouldScannerActivated? (
                <GSComponentTooltip placement={GSComponentTooltipPlacement.BOTTOM} message={i18next.t("product.barcode.enabled.explore.tooltip")}>
                    <div onClick={handleClick} className="scan_button_on">
                        <GSActionButton icon={GSActionButtonIcons.PRODUCT_SCAN_BTN_ON}/>
                    </div>
                </GSComponentTooltip>
            ):(
                <div onClick={handleClick} className="scan_button_off">
                    <GSActionButton icon={GSActionButtonIcons.PRODUCT_SCAN_BTN_OFF}/>
                </div>
            )}
            {/*SCANNER*/}
            {posScannerState.scannerState && posScannerState.shouldScannerActivated &&
            (
                <div>
                    <BarcodeReader
                        onError={handleError}
                        onScan={handleScan}
                    />
                </div>
            )}
        </>

    )
}
