import React, {useContext, useEffect, useRef, useState} from 'react'
import {AvField, AvForm} from "availity-reactstrap-validation";
import {FormValidate} from "../../../../config/form-validate";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import GSButton from "../../../../components/shared/GSButton/GSButton";
import {Trans} from "react-i18next";
import GSTrans from "../../../../components/shared/GSTrans/GSTrans";
import AvFieldCurrency from "../../../../components/shared/AvFieldCurrency/AvFieldCurrency";
import {OrderInZaloContext} from "../context/OrderInZaloContext";
import { CurrencyUtils } from '../../../../utils/number-format';

const ZaloShippingModal = props => {
    const currency = CurrencyUtils.getLocalStorageSymbol()
    const { state, dispatch } = useContext(OrderInZaloContext.context);
    
    const [stDropdownShipping, setStDropdownShipping] = useState(false)
    const [stTotalShippingModal, setStTotalShippingModal] = useState(0);
    const [stTotalShipping, setStTotalShipping] = useState(0);

    const refShippingForm = useRef()
    const refMouseLeave = useRef(false)

    const setTotal = (Total) => {
        setStTotalShipping(Total)
    }

    const setTotalInModal = (Total) => {
        setStTotalShippingModal(Total)
    }

    const handleChangeShipping = (e) => {
        setStTotalShippingModal(e.currentTarget.value)
    }

    const handleSubmitShipping = () => {
        setTotal(stTotalShippingModal)
        dispatch(
            OrderInZaloContext.actions.setShippingInfo({ amount: +(stTotalShippingModal) })
        );
        setStDropdownShipping(false)
    }

    const handleCancelShipping = (e) => {
        e.preventDefault(); // avoid fire submit action
        setTotalInModal(stTotalShipping)
        setStDropdownShipping(false)
    }

    const handleOpenShipping = () => {
        //close Shipping
        if (stDropdownShipping) {
            setTotalInModal(stTotalShipping)
            setStDropdownShipping(false)
            return
        }
        setStDropdownShipping(true)
    }

    return (
        <>
            <AvForm
                tabIndex="0"
                ref={refShippingForm} onValidSubmit={handleSubmitShipping}
                onMouseLeave={() => refMouseLeave.current = true}
                onMouseEnter={() => refMouseLeave.current = false}
                onBlur={e => refMouseLeave.current && handleCancelShipping(e)}
            >
                <div className='d-flex h-100 align-items-center color-blue purchase-discount cursor--pointer'>
                    <div className="dropdown">
                        <p onClick={handleOpenShipping} className="m-0"><GSTrans
                            t='page.gochat.facebook.conversations.Shipping'/></p>
                        <div className={stDropdownShipping ? "dropdown-menu shipping show" : "dropdown-menu shipping"}>
                            <h3 className="m-0"><GSTrans t='page.order.detail.items.shippingFee'/></h3>
                            <div className="search">
                                <AvFieldCurrency
                                    className="search-input shipping"
                                    name="shipping"
                                    value={state.shippingInfo.amount}
                                    onChange={(e) => {
                                        handleChangeShipping(e)
                                    }}

                                    validate={{
                                        ...FormValidate.maxValue(999999999),
                                        ...FormValidate.required(),
                                        ...FormValidate.minValue(0)
                                    }}
                                    position={CurrencyUtils.isPosition(currency)}
                                    precision={CurrencyUtils.isCurrencyInput(currency) && '2'}
                                    decimalScale={CurrencyUtils.isCurrencyInput(currency) && 2}
                                />
                            </div>
                            
                                <div className="gsButton">
                                    <GSButton onClick={handleCancelShipping} secondary outline>
                                        <Trans i18nKey="page.order.detail.readyToShip.btn.cancel"/>
                                    </GSButton>
                                    <GSButton success marginLeft >
                                        <Trans i18nKey="page.order.detail.readyToShip.btn.confirm"/>
                                    </GSButton>
                                </div>
                            
                        </div>

                    </div>
                </div>
            </AvForm>
        </>
    )
}

ZaloShippingModal.defaultProps = {
    
}

ZaloShippingModal.propTypes = {
   
}

export default ZaloShippingModal