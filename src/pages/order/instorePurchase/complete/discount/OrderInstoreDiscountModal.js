import './OrderInstoreDiscountModal.sass'
import React, {useContext, useEffect, useState} from 'react'
import {Modal, ModalBody, ModalHeader} from 'reactstrap'
import {bool, func} from 'prop-types'
import GSTrans from '../../../../../components/shared/GSTrans/GSTrans'
import {UikInput, UikSelect} from '../../../../../@uik'
import GSButton from '../../../../../components/shared/GSButton/GSButton'
import {BCOrderService} from '../../../../../services/BCOrderService'
import {OrderInStorePurchaseRequestBuilder} from '../../OrderInStorePurchaseRequestBuilder'
import {CouponTypeEnum} from '../../../../../models/CouponTypeEnum'
import {OrderInStorePurchaseContext} from '../../context/OrderInStorePurchaseContext'
import i18next from 'i18next'
import {CurrencyUtils} from '../../../../../utils/number-format'
import GSImg from '../../../../../components/shared/GSImg/GSImg'
import {ContextQuotation} from '../../../InstoreQuotation/context/ContextQuotation'
import {ContextQuotationService} from '../../../InstoreQuotation/context/ContextQuotationService'
import OrderInstoreDiscount from './OrderInstoreDiscount'
import Constants from '../../../../../config/Constant';
import {OrderInStorePurchaseContextService} from '../../context/OrderInStorePurchaseContextService';
import {FormValidate} from '../../../../../config/form-validate';
import AvFieldCurrency from '../../../../../components/shared/AvFieldCurrency/AvFieldCurrency';
import {AvForm} from 'availity-reactstrap-validation';

const DISCOUNT_OPTION = [
    {
        value: Constants.DISCOUNT_OPTION.DISCOUNT_CODE,
        label: i18next.t('page.order.POS.modal.option.discount.' + Constants.DISCOUNT_OPTION.DISCOUNT_CODE)
    },
    {
        value: Constants.DISCOUNT_OPTION.DISCOUNT_AMOUNT,
        label: i18next.t('page.order.POS.modal.option.discount.' + Constants.DISCOUNT_OPTION.DISCOUNT_AMOUNT)
    },
    {
        value: Constants.DISCOUNT_OPTION.DISCOUNT_PERCENT,
        label: i18next.t('page.order.POS.modal.option.discount.' + Constants.DISCOUNT_OPTION.DISCOUNT_PERCENT)
    }
]

const OrderInstoreDiscountModal = (props) => {
    const {state, dispatch} = useContext(OrderInStorePurchaseContext.context);

    const {toggle, onClose} = props

    const [stValue, setStValue] = useState(state.promotion?.couponCode || '')
    const [stError, setStError] = useState('')
    const [stDiscountOption, setStDiscountOption] = useState(Constants.DISCOUNT_OPTION.DISCOUNT_CODE)

    // const inputEvents = useWindowEventListener(['keydown'])

    // useEffect(() => {
    //     switch (inputEvents?.keydown?.keyCode) {
    //         case 27:
    //             onClose()
    //             break
    //     }
    // }, [inputEvents]);

    useEffect(() => {
        if (toggle) {
            $('#input-discount').focus()
            setStValue(state.promotion?.couponCode || (state.discountOption.type === Constants.DISCOUNT_OPTION.DISCOUNT_AMOUNT ? state.discountOption.discount : state.discountOption.percent) || '')
            setStError('')
            setStDiscountOption(state.discountOption.type)
        }

    }, [toggle])

    const handleChange = e => {
        setStError('')
        setStValue(e.currentTarget.value)
    }

    const handleKeyPress = e => {
        switch (e.key) {
            case 'Enter':
                handleApply()
                break
        }
    }

    const handleClear = () => {
        setStValue('')
        setStError('')
        dispatch(ContextQuotation.actions.clearPromotionCode())
        ContextQuotationService.dispatchUpdateProductList({
            ...state,
            promotion: undefined,
            discountCode: false
        }, dispatch, state.productList)
        dispatch(
            OrderInStorePurchaseContext.actions.applyDiscountCode({
                discount: null,
                type: Constants.DISCOUNT_OPTION.DISCOUNT_CODE
            })
        )
    }

    const handleApply = () => {
        setStError('')

        if (!state.productList?.length || !stValue) {
            return
        }
        const isWholesaleDiscount = !state.productList.every(prod => _.isEmpty(prod.wholeSale))

        switch (stDiscountOption) {
            case Constants.DISCOUNT_OPTION.DISCOUNT_CODE:
                return BCOrderService.checkPromotionCode(state.productList.map(
                    OrderInStorePurchaseRequestBuilder.createPromotionItems
                ), stValue, state.user.userId)
                    .then(result => {
                        const isWholesaleDiscount = !state.productList.every(prod => _.isEmpty(prod.wholeSale))

                        if (isWholesaleDiscount) {
                            setStError(i18next.t("page.order.create.cart.promotionCode.invalid.wholesale"));
                            return
                        }

                        if (result.couponType !== CouponTypeEnum.FREE_SHIPPING) {
                            dispatch(OrderInStorePurchaseContext.actions.clearMembership())
                        }
                        dispatch(OrderInStorePurchaseContext.actions.applyPromotionCode(result))
                        ContextQuotationService.dispatchUpdateProductList({
                            ...state,
                            promotion: result,
                            discountCode: false
                        }, dispatch, state.productList)
                        dispatch(
                            OrderInStorePurchaseContext.actions.applyDiscountCode({
                                discount: null,
                                type: stDiscountOption
                            })
                        )
                        onClose()
                    })
                    .catch(e => {
                        if (e && e.response && e.response.data && e.response.data.message) {
                            if(e.response.data.message.includes('GHTK')){
                                setStError(e.response.data.message);
                                return
                            }
                            setStError(i18next.t(e.response.data.message));
                        } else {
                            setStError(i18next.t("page.order.create.cart.promotionCode.invalid"));
                        }
                        setStValue('')
                    })
            case Constants.DISCOUNT_OPTION.DISCOUNT_AMOUNT:

                if (isWholesaleDiscount) {
                    setStError(i18next.t("page.order.POS.modal.invalid.wholesale"));
                    return
                }

                dispatch(OrderInStorePurchaseContext.actions.clearMembership())
                dispatch(
                    OrderInStorePurchaseContext.actions.applyDiscountCode({
                        discount: stValue,
                        type: stDiscountOption
                    })
                )
                dispatch(ContextQuotation.actions.clearPromotionCode())
                ContextQuotationService.dispatchUpdateProductList({
                    ...state,
                    promotion: undefined,
                    discountCode: false
                }, dispatch, state.productList)
                onClose()
                return


            case Constants.DISCOUNT_OPTION.DISCOUNT_PERCENT:
                const subTotalPrice = OrderInStorePurchaseContextService.calculateSubTotalPrice(state.productList)
                const discount = (subTotalPrice * stValue) / 100
                if (isWholesaleDiscount) {
                    setStError(i18next.t("page.order.POS.modal.invalid.wholesale"));
                    return
                }

                dispatch(OrderInStorePurchaseContext.actions.clearMembership())
                dispatch(
                    OrderInStorePurchaseContext.actions.applyDiscountCode({
                        percent: stValue,
                        discount: discount,
                        type: stDiscountOption
                    })
                )
                dispatch(ContextQuotation.actions.clearPromotionCode())
                ContextQuotationService.dispatchUpdateProductList({
                    ...state,
                    promotion: undefined,
                    discountCode: false
                }, dispatch, state.productList)
                onClose()
                return
        }
    }

    return (
        <Modal isOpen={toggle} className='order-instore-purchase-discount-modal'>
            <ModalHeader toggle={() => {
                setStDiscountOption(state.discountOption.type)
                setStValue(state.discountOption.discount)
                onClose()
            }}><GSTrans t='component.orderInstore.discountModal.title'/></ModalHeader>
            <ModalBody>
                <div className='discount-options d-flex'>
                    <UikSelect
                        className="dropdown-box"
                        defaultValue={state.discountOption.type}
                        options={DISCOUNT_OPTION}
                        onChange={({value}) => {
                            setStDiscountOption(value)
                            setStValue('')
                            setStError('')
                        }}
                    />

                    {stDiscountOption !== Constants.DISCOUNT_OPTION.DISCOUNT_CODE &&
                    <div className='position-relative w-100 avform'>
                        <AvForm>
                            <AvFieldCurrency
                                className={[
                                    'input',
                                    stError ? 'input-error' : '',
                                    stValue ? 'padding-right' : ''
                                ].join(' ')}
                                name="discount"
                                value={stValue || 0}
                                onChange={(e) => {
                                    if (e.currentTarget.value === 0) {
                                        setStValue('')
                                        return
                                    }
                                    setStValue(e.currentTarget.value)
                                }}
                                precision={stDiscountOption === Constants.DISCOUNT_OPTION.DISCOUNT_PERCENT ? '2' :
                                    CurrencyUtils.isCurrencyInput(CurrencyUtils.getLocalStorageSymbol()) ? '2' : '0'}
                                decimalScale={stDiscountOption === Constants.DISCOUNT_OPTION.DISCOUNT_PERCENT ? 2 :
                                    CurrencyUtils.isCurrencyInput(CurrencyUtils.getLocalStorageSymbol()) ? 2 : 0}
                                validate={{
                                    ...(stDiscountOption === Constants.DISCOUNT_OPTION.DISCOUNT_PERCENT ? FormValidate.maxMinValue(100, 0, true, 'message.not.allow.minimum.maximum.percent') :
                                        FormValidate.maxMinValue(OrderInStorePurchaseContextService.calculateSubTotalPrice(state.productList), 0, true, 'page.orders.returnOrder.detail.minimum.vnd', CurrencyUtils.getLocalStorageSymbol())),
                                    ...(stDiscountOption === Constants.DISCOUNT_OPTION.DISCOUNT_PERCENT ? FormValidate.minMaxValue(0, 100, true, 'message.not.allow.minimum.maximum.percent') :
                                        FormValidate.minMaxValue(0, OrderInStorePurchaseContextService.calculateSubTotalPrice(state.productList), true, 'page.orders.returnOrder.detail.minimum.vnd', CurrencyUtils.getLocalStorageSymbol())),
                                }}
                            />
                            {stValue &&
                            <GSImg className='input-clear' src='/assets/images/icon-close.svg' width={30} height={30}
                                   onClick={handleClear}/>}
                        </AvForm>
                        <div className='description'>
                            <div className='error'>{stError}</div>
                        </div>
                    </div>
                    }

                    {stDiscountOption === Constants.DISCOUNT_OPTION.DISCOUNT_CODE &&
                    <div className='position-relative w-100 avform'>
                        <UikInput
                            id='input-discount'
                            value={stValue}
                            className={[
                                'input',
                                stError ? 'input-error' : '',
                                stValue ? 'padding-right' : ''
                            ].join(' ')}
                            onChange={handleChange}
                            onKeyPress={handleKeyPress}
                        />
                        {stValue &&
                        <GSImg className='input-clear' src='/assets/images/icon-close.svg' width={30} height={30}
                               onClick={handleClear}/>}

                        <div className='description'>
                            <div className='error'>{stError}</div>
                        </div>
                    </div>
                    }
                </div>
                <div className='description'>
                    {/*MEMBERSHIP*/}
                    {
                        !state.discountOption.discount && state.membership && <div className='description__item'>
                            <GSImg src="/assets/images/membership-discount.svg" width={20} alt="membership"/>
                            <span className='ml-2 white-space-pre'>
                                <GSTrans t={"page.order.instorePurchase.membershipDiscountWithoutMax"}
                                         values={{
                                             membershipName: state.membership.name,
                                             percent: state.membership.discountPercent
                                         }}
                                >
                                    <strong>a</strong> - Discount percent%
                                </GSTrans>
                            </span>
                            &nbsp;
                            {
                                state.membership.discountMaxAmount &&
                                <span className='white-space-pre'>
                                    <GSTrans t={"page.order.instorePurchase.membershipDiscountMax"}
                                             values={{
                                                 maxAmount: CurrencyUtils.formatMoneyByCurrency(state.membership.discountMaxAmount, CurrencyUtils.getLocalStorageSymbol())
                                             }}
                                    />
                                </span>
                            }
                        </div>
                    }

                    {/*PROMOTION*/}
                    {
                        state.promotion && state.promotion.couponType == CouponTypeEnum.FREE_SHIPPING &&
                        <div className="description__item free-shipping">
                            <GSImg src="/assets/images/freeship.png" width={20} alt="promotion"/>
                            <span className='ml-2 white-space-pre'>
                                <GSTrans t='page.order.instorePurchase.freeShip' values={{
                                    shippingProviders: OrderInstoreDiscount.resolveShippingProvider(state.promotion.freeShippingProvider),
                                }}/>
                            </span>
                            &nbsp;
                            {
                                state.promotion.feeShippingValue &&
                                <span className='white-space-pre'>
                                    <GSTrans t={"page.order.instorePurchase.freeShipMax"} values={{
                                        maxAmount: CurrencyUtils.formatMoneyByCurrency(state.promotion.feeShippingValue, CurrencyUtils.getLocalStorageSymbol())
                                    }}/>
                                </span>
                            }
                        </div>
                    }
                </div>
                <div key={stValue} className="action d-flex justify-content-center mt-3">
                    <GSButton success onClick={handleApply} disabled={!stValue || stValue === '0' ||
                    (stDiscountOption === Constants.DISCOUNT_OPTION.DISCOUNT_PERCENT ? +(stValue) > 100 :
                        +(stValue) > OrderInStorePurchaseContextService.calculateSubTotalPrice(state.productList))}>
                        <GSTrans t='common.btn.apply'/>
                    </GSButton>
                </div>

            </ModalBody>
        </Modal>
    )
}

OrderInstoreDiscountModal.defaultProps = {
    toggle: false,
    onClose: () => {
    }
}

OrderInstoreDiscountModal.propTypes = {
    toggle: bool,
    onClose: func
}

export default OrderInstoreDiscountModal
