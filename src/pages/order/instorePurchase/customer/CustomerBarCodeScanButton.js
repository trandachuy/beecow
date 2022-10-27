import React from 'react';
import BarcodeReader from 'react-barcode-reader'
import {Tooltip} from 'react-tippy';
import i18next from "i18next";
import {useRecoilState} from "recoil";
import {OrderInStorePurchaseRecoil} from "../recoil/OrderInStorePurchaseRecoil";

export const CustomerBarCodeScanButton = ({handleScan,handleError})=>{
     const [posScannerState, setPosScannerState] = useRecoilState(OrderInStorePurchaseRecoil.posScannerState)

    const handleClick = () => {
        if (posScannerState.shouldCustomerScannerActivated) {
            setPosScannerState(state => ({
                ...state,
                customerScannerState: !state.customerScannerState
            }))
            if (posScannerState.scannerState) {
                setPosScannerState(state => ({
                    ...state,
                    scannerState: !state.scannerState
                }))
            } else {
                setPosScannerState(state => ({
                    ...state,
                    scannerState: true
                }))
            }
        }
    }
    return (
        <div className='customer-scanner-button'>
            {
                (posScannerState.customerScannerState? (
                            <Tooltip arrow followCursor position={"bottom"} title={i18next.t("customer.barcode.enabled.explore.tooltip")}>
                                <div onClick={handleClick}>
                                    <img width='40px' height='40px' src='/assets/images/customer-barcode-scanner-on.svg'/>
                                </div>
                            </Tooltip>)
                        : <div onClick={handleClick}>
                            <img width='40px' height='40px' src='/assets/images/customer-barcode-scanner-off.svg'/>
                        </div>
                )
            }
            {posScannerState.customerScannerState && posScannerState.shouldCustomerScannerActivated? (
                <div>
                    <BarcodeReader
                        onError={handleError}
                        onScan={handleScan}
                    />
                </div>
            ) : null}
        </div>
    )
}
