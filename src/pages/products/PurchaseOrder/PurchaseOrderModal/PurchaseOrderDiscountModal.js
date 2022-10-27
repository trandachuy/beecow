import React, {useEffect, useRef, useState} from 'react'
import {AvField, AvForm} from "availity-reactstrap-validation";
import {FormValidate} from "../../../../config/form-validate";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import GSButton from "../../../../components/shared/GSButton/GSButton";
import {Trans} from "react-i18next";
import GSTrans from "../../../../components/shared/GSTrans/GSTrans";
import {func, number, oneOf} from "prop-types";
import Constants from "../../../../config/Constant";
import AvFieldCurrency from "../../../../components/shared/AvFieldCurrency/AvFieldCurrency";


const PURCHASE_ORDER_DISCOUNT_TYPE = {
    VALUE: 'VALUE', PERCENTAGE: 'PERCENTAGE'
}

const PurchaseOrderDiscountModal = props => {
    const {getDiscount, value, type, editorMode,getSubTotal,currency, ...others } = props;
    const [stDropdownDiscount, setStDropdownDiscount] = useState(false)
    const [stTotalDiscountModal, setStTotalDiscountModal] = useState(0);
    const [stIsPercentageAndValueModal, setStIsPercentageAndValueModal] = useState(true);
    const [stTotalDiscount, setStTotalDiscount] = useState(0);
    const [stIsPercentageAndValue, setStIsPercentageAndValue] = useState(true);
    const [checkCurrencyVN, setCheckCurrencyVN] = useState(true)

    const refDiscountForm = useRef()
    const refMouseLeave = useRef(false)

    useEffect(() => {
        setTotalAndValuePercentage(value, type === PURCHASE_ORDER_DISCOUNT_TYPE.VALUE)
        setTotalAndValuePercentageInModal(value, type === PURCHASE_ORDER_DISCOUNT_TYPE.VALUE)
    }, [value, type])

    useEffect(() => {
        if(currency !== Constants.CURRENCY.VND.SYMBOL && currency !== Constants.CURRENCY.VND.SYMBOL){
            setCheckCurrencyVN(false)
        }
    }, [])


    const setTotalAndValuePercentage = (Total, ValuePercentage) => {
        setStTotalDiscount(Total)
        setStIsPercentageAndValue(ValuePercentage)
    }

    const setTotalAndValuePercentageInModal = (Total, ValuePercentage) => {
        setStTotalDiscountModal(Total)
        setStIsPercentageAndValueModal(ValuePercentage)
    }

    const handleChangeDiscount = (e) => {
        setStTotalDiscountModal(e.currentTarget.value)
    }

    const handleSubmitDiscount = () => {
        let purchaseType;
        setTotalAndValuePercentage(stTotalDiscountModal, stIsPercentageAndValueModal)
        setStDropdownDiscount(false)

        if (stIsPercentageAndValueModal) {
            purchaseType = PURCHASE_ORDER_DISCOUNT_TYPE.VALUE
        } else {
            purchaseType = PURCHASE_ORDER_DISCOUNT_TYPE.PERCENTAGE
        }

        getDiscount(stTotalDiscountModal, purchaseType)
    }

    const handleCancelDiscount = (e) => {
        e.preventDefault(); // avoid fire submit action
        setTotalAndValuePercentageInModal(stTotalDiscount, stIsPercentageAndValue)
        setStDropdownDiscount(false)
    }


    const handleOpenDiscount = () => {
        //close discount
        if (stDropdownDiscount) {
            setTotalAndValuePercentageInModal(stTotalDiscount, stIsPercentageAndValue)
            setStDropdownDiscount(false)
            return
        }
        setStDropdownDiscount(true)
    }

    const handleChangeType = () => {
        if (editorMode === Constants.PURCHASE_ORDER_MODE.WIZARD) {
            return
        }

        setStIsPercentageAndValueModal(toggle => !toggle)
    }

    return (
        <>
            <AvForm
                tabIndex="0"
                ref={refDiscountForm} onValidSubmit={handleSubmitDiscount}
                onMouseLeave={() => refMouseLeave.current = true}
                onMouseEnter={() => refMouseLeave.current = false}
                onBlur={e => refMouseLeave.current && handleCancelDiscount(e)}
            >
                <div className='d-flex h-100 align-items-center ml-xl-4 color-blue purchase-discount'>
                    <div className="dropdown">
                        <p onClick={handleOpenDiscount} className="m-0"><GSTrans
                            t='page.purchaseOrderFormEditor.table.summary.discount'/></p>
                        <div className={stDropdownDiscount ? "dropdown-menu show" : "dropdown-menu"}>
                            <h3 className="m-0"><GSTrans t='page.purchaseOrderFormEditor.table.summary.discount'/></h3>
                            <div className="search">
                                <AvFieldCurrency
                                    disabled={editorMode === Constants.PURCHASE_ORDER_MODE.WIZARD}
                                    className="search-input"
                                    name="discount"
                                    value={stTotalDiscountModal}
                                    onChange={(e) => {
                                        if (editorMode === Constants.PURCHASE_ORDER_MODE.WIZARD) {
                                            return
                                        }

                                        handleChangeDiscount(e)
                                    }}
                                    precision={!checkCurrencyVN && '2' }
                                    decimalScale={!checkCurrencyVN &&  2 }
                                    validate={{
                                        ...(!stIsPercentageAndValueModal ? FormValidate.maxValue(100) : FormValidate.maxValue(getSubTotal)),
                                        ...FormValidate.required(),
                                        ...FormValidate.minValue(0)
                                    }}
                                />

                                <div onClick={handleChangeType}
                                     className={!stIsPercentageAndValueModal ? "icon active" : "icon"}>
                                    <FontAwesomeIcon icon={"percent"}/>
                                </div>

                                <p onClick={handleChangeType}
                                   className={stIsPercentageAndValueModal ? "active m-0" : "m-0"}>
                                       {<GSTrans t='page.purchaseOrderFormEditor.table.summary.value'/>}</p>
                            </div>
                            {
                                editorMode !== Constants.PURCHASE_ORDER_MODE.WIZARD && <div className="gsButton">
                                    <GSButton onClick={handleCancelDiscount} secondary outline>
                                        <Trans i18nKey="page.order.detail.readyToShip.btn.cancel"/>
                                    </GSButton>
                                    <GSButton success marginLeft onClick={e => {
                                        e.preventDefault()
                                        refDiscountForm.current.submit()
                                    }}>
                                        <Trans i18nKey="page.order.detail.readyToShip.btn.confirm"/>
                                    </GSButton>
                                </div>
                            }
                        </div>

                    </div>
                </div>
            </AvForm>
        </>
    )
}

PurchaseOrderDiscountModal.defaultProps = {
    editorMode: Constants.PURCHASE_ORDER_MODE.CREATE,
    getSubTotal:0
}

PurchaseOrderDiscountModal.propTypes = {
    editorMode: oneOf(Object.keys(Constants.PURCHASE_ORDER_MODE)),
    value: number,
    type: oneOf(Object.keys(PURCHASE_ORDER_DISCOUNT_TYPE)),
    getDiscount: func,
    getSubTotal:func,
}

export default PurchaseOrderDiscountModal