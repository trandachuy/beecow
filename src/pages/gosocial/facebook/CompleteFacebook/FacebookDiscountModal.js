import React, {useContext, useRef, useState} from 'react'
import {AvForm} from "availity-reactstrap-validation";
import {FormValidate} from "../../../../config/form-validate";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import GSButton from "../../../../components/shared/GSButton/GSButton";
import {Trans} from "react-i18next";
import GSTrans from "../../../../components/shared/GSTrans/GSTrans";
import AvFieldCurrency from "../../../../components/shared/AvFieldCurrency/AvFieldCurrency";
import {FbMessengerContext} from "../context/FbMessengerContext";
import {OrderInFacebookContextService} from "../context/OrderInFacebookContextService";
import { CurrencyUtils } from '../../../../utils/number-format';

const FACEBOOK_DISCOUNT_TYPE = {
    VALUE: 'VALUE', PERCENTAGE: 'PERCENTAGE'
}

const FacebookDiscountModal = props => {
    const currency = CurrencyUtils.getLocalStorageSymbol()
    const { state, dispatch } = useContext(FbMessengerContext.context);
    const [stDropdownDiscount, setStDropdownDiscount] = useState(false)
    const [stTotalDiscountModal, setStTotalDiscountModal] = useState(0);
    const [stIsPercentageAndValueModal, setStIsPercentageAndValueModal] = useState(true);
    const [stTotalDiscount, setStTotalDiscount] = useState(0);
    const [stIsPercentageAndValue, setStIsPercentageAndValue] = useState(true);

    const refDiscountForm = useRef()
    const refMouseLeave = useRef(false)

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
        setTotalAndValuePercentage(stTotalDiscountModal, stIsPercentageAndValueModal)
        dispatch(
            FbMessengerContext.actions.setDiscountInfo({ amount: +(stTotalDiscountModal),method:stIsPercentageAndValueModal 
                    ? FACEBOOK_DISCOUNT_TYPE.VALUE : FACEBOOK_DISCOUNT_TYPE.PERCENTAGE })
        );
        setStDropdownDiscount(false)
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
                <div className='d-flex h-100 align-items-center color-blue purchase-discount cursor--pointer'>
                    <div className="dropdown">
                        <p onClick={handleOpenDiscount} className="m-0"><GSTrans
                            t='page.purchaseOrderFormEditor.table.summary.discount'/></p>
                        <div className={stDropdownDiscount ? "dropdown-menu show" : "dropdown-menu"}>
                            <h3 className="m-0"><GSTrans t='page.purchaseOrderFormEditor.table.summary.discount'/></h3>
                            <div className="search">
                                <AvFieldCurrency
                                    className="search-input"
                                    name="discount"
                                    value={state.discountInfo.amount}
                                    onChange={(e) => {
                                        handleChangeDiscount(e)
                                    }}
                                    validate={{
                                        ...(!stIsPercentageAndValueModal ? FormValidate.maxValue(100) : FormValidate.maxValueMoney(OrderInFacebookContextService.calculateSubTotalPrice(state.productList))),
                                        ...FormValidate.required(),
                                        ...FormValidate.minValue(0)
                                    }}
                                    position={CurrencyUtils.isPosition(currency)}
                                    precision={CurrencyUtils.isCurrencyInput(currency) && '2'}
                                    decimalScale={CurrencyUtils.isCurrencyInput(currency) && 2}
                                />

                                <div onClick={handleChangeType}
                                     className={!stIsPercentageAndValueModal ? "icon active" : "icon"}>
                                    <FontAwesomeIcon icon={"percent"}/>
                                </div>

                                <p onClick={handleChangeType}
                                   className={stIsPercentageAndValueModal ? "active m-0" : "m-0"}>{<GSTrans
                                    t='page.purchaseOrderFormEditor.table.summary.value'/>}</p>
                            </div>
                            <div className="gsButton">
                                <GSButton onClick={handleCancelDiscount} secondary outline>
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

FacebookDiscountModal.defaultProps = {}

FacebookDiscountModal.propTypes = {}

export default FacebookDiscountModal