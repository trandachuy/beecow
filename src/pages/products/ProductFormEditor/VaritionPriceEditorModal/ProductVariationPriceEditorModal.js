/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 11/11/2020
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import './ProductVariationPriceEditorModal.sass'
import Modal from "reactstrap/es/Modal";
import ModalHeader from "reactstrap/es/ModalHeader";
import ModalBody from "reactstrap/es/ModalBody";
import ModalFooter from "reactstrap/es/ModalFooter";
import {AvForm} from "availity-reactstrap-validation"
import GSButton from "../../../../components/shared/GSButton/GSButton";
import GSTrans from "../../../../components/shared/GSTrans/GSTrans";
import AvFieldCurrency from "../../../../components/shared/AvFieldCurrency/AvFieldCurrency";
import CryStrapInput, {CurrencySymbol} from "../../../../components/shared/form/CryStrapInput/CryStrapInput";
import {CurrencyUtils} from "../../../../utils/number-format";
import i18next from "i18next";
import {UikSelect} from "../../../../@uik"
import Constants from "../../../../config/Constant";
import _ from "lodash"
import {ItemService} from "../../../../services/ItemService"

const ERROR_KEY = {
    NO_BRANCH: 'page.product.updateStockModal.emptyBranch',
    NEGATIVE_STOCK: 'page.product.updateStockModal.negativeStock',
    OVER_STOCK: 'page.product.updateStockModal.overStock',
    UNDER_PRICE: 'common.validation.number.min.value',
    OVER_PRICE: 'common.validation.number.max.value',
    EQUAL_LOWER: "common.validation.costPrice.value",
    NONE: ''
}

const UPDATE_PRICE_TYPE = {
    PRICE: 'PRICE',
    DISCOUNT: 'D_PRICE',
    COST: 'C_PRICE'
}
const ProductVariationPriceEditorModal = props => {
    const VALIDATE_PRICE = {
        MIN: 0,
        MAX: 99999999999,
    }
    
    const [stPriceType, setStPriceType] = useState(UPDATE_PRICE_TYPE.PRICE);
    const [stVariationTable, setStVariationTable] = useState(props.variationTable);
    const [stApplyPriceError, setStApplyPriceError] = useState(ERROR_KEY.NONE);
    const [stOrgPriceErrors, setStOrgPriceErrors] = useState([]);
    const [stDiscountPriceErrors, setStDiscountPriceErrors] = useState([]);
    const [stCostPriceErrors, setStCostPriceErrors] = useState([]);
    const [stApplyAllValue, setStApplyAllValue] = useState('');
    //const [allVarsWholesale, setAllVarsWholesale] = useState(props.allVarsWholesale);
    const [isConfigWholesale, setIsConfigWholesale] = useState(props.settingWholesale)
    const [isDisabledBtnSave, setIsDisabledBtnSave] = useState(false)

    useEffect(() => {
        if (props.variationTable) {
            setStVariationTable(_.cloneDeep(props.variationTable))
        }
    }, [props.variationTable]);


    const getPriceErrorMessage = (price) => {
        let error = ERROR_KEY.NONE
        const parsedPrice = parseFloat(price)
        if (isNaN(parsedPrice) || parsedPrice == null) {
            if (stPriceType === UPDATE_PRICE_TYPE.PRICE) {
                error = i18next.t(ERROR_KEY.UNDER_PRICE, {x: CurrencyUtils.formatThousand(VALIDATE_PRICE.MIN)})
            }
        } else {
            if (parsedPrice < VALIDATE_PRICE.MIN) {
                error = i18next.t(ERROR_KEY.UNDER_PRICE, {x: CurrencyUtils.formatThousand(VALIDATE_PRICE.MIN)})
            } else if (parsedPrice > VALIDATE_PRICE.MAX) {
                error = i18next.t(ERROR_KEY.OVER_PRICE, {x: CurrencyUtils.formatThousand(VALIDATE_PRICE.MAX)})
            }
        }
        return error
    }
    const checkAllErrors = (array) => {
        return array.some(item => (item !== '' && item !== undefined))
        // for(const {errors} of array){
        //     return errors.some( item => (item !== '' && item !== undefined) )
        // }
    }

    const isValid = () => {

        return stVariationTable.every((_var, index) => {
            if (props.checkedList.includes(index)) {
                return validateOrgPrice(_var.orgPrice, index) & validateDiscountPrice(_var.orgPrice, _var.costPrice, _var.price, index)

            }
            return true
        })
    }

    const onSave = (e) => {
        // e.preventDefault()
        if (isValid()) {
            props.onSave(stVariationTable)
        }
    }
    const formatCurrency = (input) => {
        return String(checkSymbolInput(props.symbolCode,input)).replace(props.symbolCode === Constants.CURRENCY.VND.SYMBOL ? /[.,]/g : /[,]/g, '')
    }

    const onChangeApplyAllValue = (e) => {
        const {name, value} = e.currentTarget
        setStApplyAllValue(formatCurrency(value))
    }
    const handelErrorDiscountPrice = (result) => {
        const clonedTable = [...stVariationTable]
        let error = []``
        for (const item of clonedTable) {
            let getValue = result.find(r => r.modelId === item.id)
            if (getValue) {
                if (getValue.status === 0) {
                    error.push(i18next.t('component.wholesalePrice.error.wholesale_price_higher_sale_price'))
                } else {
                    error.push('')
                }
            } else {
                error.push('')
            }
        }
        if (checkAllErrors(error)) {
            setIsDisabledBtnSave(true)
        } else {
            setIsDisabledBtnSave(false)
        }
        setStDiscountPriceErrors(error)

    }

    const checkSalePriceForWholesale = (price, checkIndex) => {
        const clonedTable = [...stVariationTable]
        let data = {
            itemId: clonedTable[0].itemId,
            lstData: []
        }
        if (checkIndex === 'ALL') {
            for (const idx of props.checkedList) {
                const row = clonedTable[idx]
                data.lstData.push({
                    itemId: row.itemId,
                    modelId: row.id,
                    newPrice: price
                })
            }
        } else {
            const row = clonedTable[checkIndex]
            data.lstData.push({
                itemId: row.itemId,
                modelId: row.id,
                newPrice: price
            })
        }
        ItemService.checkMaxSellingPriceForWholesale(data)
            .then(result => {
                if (result) {
                    handelErrorDiscountPrice(result)
                }
            })
            .catch(err => {
                console.log(err)
            })
    }

    const onClickApplyAllValue = (e) => {
        e.preventDefault()

        if (stApplyAllValue && !stApplyPriceError) {
            const clonedTable = [...stVariationTable]
            if (isConfigWholesale && props.mode === 'edit') {
                if (stPriceType === UPDATE_PRICE_TYPE.DISCOUNT) {
                    checkSalePriceForWholesale(checkSymbolInput(props.symbolCode,stApplyAllValue), 'ALL')
                }
            } else {
                setIsDisabledBtnSave(false)
            }

            for (const idx of props.checkedList) {
                const row = clonedTable[idx]
                if (stPriceType === UPDATE_PRICE_TYPE.PRICE) {
                    row.orgPrice = checkSymbolInput(props.symbolCode,stApplyAllValue)
                }
                if (stPriceType === UPDATE_PRICE_TYPE.DISCOUNT) {
                    row.price =  checkSymbolInput(props.symbolCode,stApplyAllValue)
                }
                if (stPriceType === UPDATE_PRICE_TYPE.COST) {
                    row.costPrice = checkSymbolInput(props.symbolCode,stApplyAllValue)
                }
                if (props.modalMode === Constants.PRODUCT_VARIATION_EDITOR_MODE.DEPOSIT) { // update both of orgPrice and price
                    row.price = checkSymbolInput(props.symbolCode,stApplyAllValue)
                }
                if (props.modalMode === Constants.PRODUCT_VARIATION_EDITOR_MODE.DEPOSIT) { // update both of costPrice and price
                    row.costPrice = checkSymbolInput(props.symbolCode,stApplyAllValue)
                }
            }

            setStVariationTable(clonedTable)
        }
    }

    const validateOrgPrice = (orgPrice, index) => {
        const error = getPriceErrorMessage(orgPrice)

        setStOrgPriceErrors(errors => {
            errors[index] = error

            return [...errors]
        })

        return !error
    }

    const validateDiscountPrice = (orgPrice, costPrice, discountPrice, index) => {
        let error
        if (parseFloat(discountPrice) > parseFloat(orgPrice)) {
            error = i18next.t(ERROR_KEY.OVER_PRICE, {x: CurrencyUtils.formatThousand(orgPrice,props.symbolCode)})
        } else if (parseFloat(discountPrice) < parseFloat(costPrice)) {
            error = i18next.t(ERROR_KEY.UNDER_PRICE, {x: CurrencyUtils.formatThousand(costPrice,props.symbolCode)})
        } else {
            error = getPriceErrorMessage(discountPrice)
        }

        setStDiscountPriceErrors(errors => {
            errors[index] = error

            return [...errors]
        })
        if (!error && isConfigWholesale && props.mode === 'edit') {
            checkSalePriceForWholesale(checkSymbolInput(props.symbolCode,discountPrice), index)
        }
        return !error
    }

    const onChangeOrgPrice = (e, index) => {
        const {value, name} = e.currentTarget
        const clonedTable = [...stVariationTable]
        clonedTable[index].orgPrice = formatCurrency(value)
        if (props.modalMode === Constants.PRODUCT_VARIATION_EDITOR_MODE.DEPOSIT) {
            clonedTable[index].price = formatCurrency(value)
        }
        setStVariationTable(clonedTable)

        validateOrgPrice(clonedTable[index].orgPrice, index)
    }

    const onChangeDiscountPrice = (e, index) => {
        const {value, name} = e.currentTarget
        const clonedTable = [...stVariationTable]
        //BH-5173 if new price = 0, set to default value is org price
        if (!value || value === 0) {
            clonedTable[index].price = clonedTable[index].orgPrice;
        } else {
            clonedTable[index].price = formatCurrency(value)
        }
        setStVariationTable(clonedTable)

        validateDiscountPrice(clonedTable[index].orgPrice, clonedTable[index].costPrice, clonedTable[index].price, index)
    }

    const onChangeCostPrice = (e, index) => {
        const {value, name} = e.currentTarget
        const clonedTable = [...stVariationTable]

        //BH-5173 if new price = 0, set to default value is org price
        if (!value || value === 0) {
            clonedTable[index].costPrice = clonedTable[index].price;
        } else {
            clonedTable[index].costPrice = formatCurrency(value)
        }
        setStVariationTable(clonedTable)

        validateCostPrice(clonedTable[index].costPrice, index)
    }

    const validateCostPrice = (costPrice, index) => {
        let error
        const price = stVariationTable[index].price
        if (parseFloat(costPrice) > parseFloat(price)) {
            error = i18next.t(ERROR_KEY.EQUAL_LOWER, {x: CurrencyUtils.formatThousand(price)})
        }
        setStCostPriceErrors(errors => {
            errors[index] = error
            return [...errors]
        })
        return !error
    }

    const getLabels = () => {
        let labelArray = []
        if (Array.isArray(stVariationTable[0].label)) {
            labelArray = stVariationTable[0].label
        } else {
            labelArray = stVariationTable[0].label.split('|')
        }

        if (props.modalMode === Constants.PRODUCT_VARIATION_EDITOR_MODE.VARIATION) {
            return labelArray.filter(lb => lb !== Constants.DEPOSIT.DEPOSIT_CODE)
        }
        return labelArray
    }

    const checkSymbolInput = (symbol, value) => {
        if (symbol === Constants.CURRENCY.VND.SYMBOL) {
            return parseInt(value)
        } else {
            return parseFloat(value).toFixed(2)
        }
    }

    return (
        <Modal isOpen={props.isOpen} className="product-variation-price-editor-modal" size="lg" key={props.isOpen}>
            {/*AVOID SUBMIT OUTER FORM*/}
            <ModalHeader toggle={props.onCancel}>
                <GSTrans t="page.product.updatePriceModal.title"/>
            </ModalHeader>
            <ModalBody>
                <AvForm>
                    <div className="d-flex align-items-center product-variation-price-editor-modal__apply-all-wrapper">
                        {props.modalMode !== Constants.PRODUCT_VARIATION_EDITOR_MODE.DEPOSIT &&
                        <UikSelect
                            defaultValue={stPriceType}
                            options={[
                                {
                                    label: i18next.t("component.product.addNew.pricingAndInventory.price"),
                                    value: UPDATE_PRICE_TYPE.PRICE
                                },
                                {
                                    label: i18next.t("component.product.addNew.pricingAndInventory.discountPrice"),
                                    value: UPDATE_PRICE_TYPE.DISCOUNT
                                },
                                {
                                    label: i18next.t("component.product.addNew.pricingAndInventory.costPrice"),
                                    value: UPDATE_PRICE_TYPE.COST
                                }
                            ]}
                            className="mr-2 product-variation-price-editor-modal__select-price-type"
                            onChange={({label, value}) => setStPriceType(value)}
                        />}
                        {props.modalMode === Constants.PRODUCT_VARIATION_EDITOR_MODE.DEPOSIT &&
                        <UikSelect
                            defaultValue={stPriceType}
                            options={[
                                {
                                    label: i18next.t("page.order.instorePurchase.print.kpos.product.price"),
                                    value: UPDATE_PRICE_TYPE.PRICE
                                }
                            ]}
                            className="mr-2 product-variation-price-editor-modal__select-price-type"
                            onChange={({label, value}) => setStPriceType(value)}
                        />}

                        <div className='product-variation-price-editor-modal__apply-price'>
                            <AvFieldCurrency name={"apply-all"}
                                             parentClassName={stApplyPriceError ? "cur-input--error" : ''}
                                             unit={props.symbolCode}
                                             value={stApplyAllValue}
                                             onBlur={onChangeApplyAllValue}
                                             position={CurrencyUtils.isPosition(props.symbolCode)}
                                             precision={CurrencyUtils.isCurrencyInput(props.symbolCode) && '2'}
                                             decimalScale={CurrencyUtils.isCurrencyInput(props.symbolCode) && 2}
                            />
                            <span className='cur-text--error'>{stApplyPriceError}</span>
                        </div>

                        <GSButton primary marginLeft onClick={onClickApplyAllValue}>
                            <GSTrans t={"component.product.addNew.stock.applyAll"}/>
                        </GSButton>
                    </div>

                    <div className="mt-5 product-variation-price-editor-modal__table-wrapper">
                        {stVariationTable && stVariationTable.length > 0 &&
                        <table
                            className="product-variation-price-editor-modal__table w-100 gsa-border-color--gray"
                            border="1px">
                            <thead>
                            <tr>
                                {getLabels().map(label => (
                                    <th>
                                        {label === Constants.DEPOSIT_CODE.CODE ? i18next.t("page.product.create.variation.deposit") : label}
                                    </th>
                                ))}

                                <th>
                                    <GSTrans t={"component.product.addNew.pricingAndInventory.price"}/>
                                </th>
                                {props.modalMode !== Constants.PRODUCT_VARIATION_EDITOR_MODE.DEPOSIT &&
                                <th>
                                    <GSTrans t={"component.product.addNew.pricingAndInventory.discountPrice"}/>
                                </th>
                                }
                                {props.modalMode !== Constants.PRODUCT_VARIATION_EDITOR_MODE.DEPOSIT &&
                                <th>
                                    <GSTrans t={"component.product.addNew.pricingAndInventory.costPrice"}/>
                                </th>
                                }
                            </tr>
                            </thead>
                            <tbody>
                            {stVariationTable.map((row, index) => (props.checkedList.includes(index) &&
                                <tr key={row.tId}>
                                    {row.var1 &&
                                    <td>
                                        {row.var1}
                                    </td>
                                    }
                                    {row.var2 && getLabels().length >= 2 &&
                                    <td>
                                        {row.var2}
                                    </td>
                                    }
                                    {row.var3 && getLabels().length === 3 &&
                                    <td>
                                        {row.var3}
                                    </td>
                                    }
                                    {row.var4 && getLabels().length === 4 &&
                                    <td>
                                        {row.var4}
                                    </td>
                                    }

                                    <td>
                                        <div className='wrapper'>
                                            <AvFieldCurrency className="input-min-width"
                                                             parentClassName={stOrgPriceErrors[index] ? "cur-input--error" : ''}
                                                             name={index + '-orgPrice'}
                                                             value={row.orgPrice}
                                                             unit={props.symbolCode}
                                                             onBlur={(e) => onChangeOrgPrice(e, index)}
                                                             position={CurrencyUtils.isPosition(props.symbolCode)}
                                                             precision={CurrencyUtils.isCurrencyInput(props.symbolCode) && '2'}
                                                             decimalScale={CurrencyUtils.isCurrencyInput(props.symbolCode) && 2}
                                            />
                                            <span className='cur-text--error'
                                                  key={stOrgPriceErrors[index]}>{stOrgPriceErrors[index]}</span>
                                        </div>
                                    </td>
                                    {props.modalMode !== Constants.PRODUCT_VARIATION_EDITOR_MODE.DEPOSIT &&
                                    <td>
                                        <div className='wrapper'>
                                            <AvFieldCurrency className="input-min-width"
                                                             parentClassName={stDiscountPriceErrors[index] ? "cur-input--error" : ''}
                                                             name={index + '-discountPrice'}
                                                             value={row.price}
                                                             unit={props.symbolCode}
                                                             onBlur={(e) => onChangeDiscountPrice(e, index)}
                                                             position={CurrencyUtils.isPosition(props.symbolCode)}
                                                             precision={CurrencyUtils.isCurrencyInput(props.symbolCode) && '2'}
                                                             decimalScale={CurrencyUtils.isCurrencyInput(props.symbolCode) && 2}
                                            />
                                            <span className='cur-text--error'
                                                  key={stDiscountPriceErrors[index]}>{stDiscountPriceErrors[index]}</span>
                                        </div>
                                    </td>
                                    }
                                    {props.modalMode !== Constants.PRODUCT_VARIATION_EDITOR_MODE.DEPOSIT &&
                                    <td>
                                        <div className='wrapper'>
                                            <AvFieldCurrency className="input-min-width"
                                                             parentClassName={stCostPriceErrors[index] ? "cur-input--error" : ''}
                                                             name={index + '-costPrice'}
                                                             value={row.costPrice}
                                                             unit={props.symbolCode}
                                                             onBlur={(e) => onChangeCostPrice(e, index)}
                                                             position={CurrencyUtils.isPosition(props.symbolCode)}
                                                             precision={CurrencyUtils.isCurrencyInput(props.symbolCode) && '2'}
                                                             decimalScale={CurrencyUtils.isCurrencyInput(props.symbolCode) && 2}
                                            />
                                            <span className='cur-text--error'
                                                  key={stCostPriceErrors[index]}>{stCostPriceErrors[index]}</span>
                                        </div>
                                    </td>
                                    }
                                </tr>
                            ))}
                            </tbody>
                        </table>}
                    </div>
                </AvForm>
            </ModalBody>
            <ModalFooter>
                <GSButton secondary outline marginRight onClick={e => {
                    e.preventDefault()
                    props.onCancel()
                }}>
                    <GSTrans t={"common.btn.cancel"}/>
                </GSButton>
                <GSButton success onClick={() => onSave()} disabled={isDisabledBtnSave}>
                    <GSTrans t={"common.btn.update"}/>
                </GSButton>
            </ModalFooter>
        </Modal>
    );
};

ProductVariationPriceEditorModal.defaultProps = {
    selected: [],
    variationTable: [],
    onChange: () => {
    },
}

ProductVariationPriceEditorModal.propTypes = {
    isOpen: PropTypes.bool,
    item: PropTypes.object,
    mode: PropTypes.string,

    onCancel: PropTypes.func,
    variationTable: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.number,
        imagePosition: PropTypes.number,
        itemId: PropTypes.number,
        label: PropTypes.string,
        orgPrice: PropTypes.number,
        price: PropTypes.number,
        tId: PropTypes.string,
        costPrice: PropTypes.number,
    }),),
    variationLength: PropTypes.number,
    prodName: PropTypes.string,
    onChange: PropTypes.func,
    onSave: PropTypes.func,
    checkedList: PropTypes.array,
    modalMode: PropTypes.string,
    symbolCode: PropTypes.string
};

export default ProductVariationPriceEditorModal;
