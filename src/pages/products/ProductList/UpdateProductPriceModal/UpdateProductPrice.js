import React, {useState, useEffect} from 'react';
import PropTypes, { string } from 'prop-types';
import Modal from "reactstrap/es/Modal"
import ModalHeader from "reactstrap/es/ModalHeader";
import ModalBody from "reactstrap/es/ModalBody";
import ModalFooter from "reactstrap/es/ModalFooter";
import GSTrans from "@shared/GSTrans/GSTrans";
import {AvForm} from "availity-reactstrap-validation";
import GSButton from "@shared/GSButton/GSButton";
import AvFieldCurrency from "@shared/AvFieldCurrency/AvFieldCurrency";
import {ItemService} from "@services/ItemService";
import {CurrencyUtils} from "@utils/number-format";
import i18next from "i18next";
import {CredentialUtils} from "@utils/credential";
import {GSToast} from "@utils/gs-toast";
import LoadingScreen from "@components/shared/LoadingScreen/LoadingScreen";
import Loading, {LoadingStyle} from "@components/shared/Loading/Loading";
import './UpdateProductPrice.sass'
import '../../ProductFormEditor/VaritionPriceEditorModal/ProductVariationPriceEditorModal.sass'
import {UikSelect} from "../../../../@uik";
import GSComponentTooltip, {
    GSComponentTooltipPlacement,
} from "@components/shared/GSComponentTooltip/GSComponentTooltip";

const ERROR_KEY = {
    NO_BRANCH: 'page.product.updateStockModal.emptyBranch',
    NEGATIVE_STOCK: 'page.product.updateStockModal.negativeStock',
    OVER_STOCK: 'page.product.updateStockModal.overStock',
    MIN_VALUE: 'common.validation.number.min.value',
    MAX_VALUE: 'common.validation.number.max.value',
    EQUAL_LOWER_COST_PRICE: "common.validation.costPrice.value",
    EQUAL_HIGHER_ORG_PRICE: "common.validation.orgPrice.value",
    NONE: ''
}
const VALIDATE_PRICE = {
    MIN: 0,
    MAX: 99999999999,
}
const UPDATE_PRICE_TYPE = {
    // ALL: 'ALL',
    ORG: 'ORG_PRICE', //LIST_PRICE
    NEW: 'NEW_PRICE', //SELLING_PRICE
    COST: 'COST_PRICE'
}
const UpdateProductPrice = (props) => {

    const [stPriceType, setStPriceType] = useState(UPDATE_PRICE_TYPE.ORG);
    const [stApplyPriceError, setStApplyPriceError] = useState(ERROR_KEY.NONE);
    const [stApplyAllValue, setStApplyAllValue] = useState('');
    const [stIsSaving, setStIsSaving] = useState(false);
    const [stOrgPriceErrors, setStOrgPriceErrors] = useState([]);
    const [stNewPriceErrors, setStNewPriceErrors] = useState([]);
    const [stCostPriceErrors, setStCostPriceErrors] = useState([]);
    const [stIsFetching, setStIsFetching] = useState(true);
    const [stVariationTable, setStVariationTable] = useState([]);
    const disabledUpdatePrice = !CredentialUtils.ROLE.RESELLER.allowUpdatedPrice() && CredentialUtils.ROLE.RESELLER.isReSeller()
    const [isDisabledBtnSave, setIsDisabledBtnSave] = useState(true)

    useEffect(() => {
        const error = getPriceErrorMessage(stApplyAllValue)
        setStApplyPriceError(error)
    }, [stApplyAllValue, stPriceType])

    useEffect(() => {
        if (!props.isOpen) return
        checkValidateRow(stVariationTable)
    }, [stVariationTable])

    useEffect(() => {
        if (props.isOpen) {
            setStIsFetching(true)
            const list = props.items.map(item => item.id)
            ItemService.getListPriceByMultipleItem(list)
                .then(result => {
                    setStVariationTable(result.lstData)
                })
                .catch((err) => {
                    console.log(err)
                })
                .finally(() => {
                    setStIsFetching(false)
                })
        } else {
            // reset
        }
    }, [props.isOpen]);

    const getPriceErrorMessage = (price) => {
        let error = ERROR_KEY.NONE
        const parsedPrice = parseFloat(price)

        if (!isNaN(parsedPrice) && parsedPrice !== null) {
            if (stPriceType === UPDATE_PRICE_TYPE.COST) {
                if (parsedPrice < 0) {
                    error = i18next.t(ERROR_KEY.MIN_VALUE, {x: 0})
                } else if (parsedPrice > VALIDATE_PRICE.MAX) {
                    error = i18next.t(ERROR_KEY.MAX_VALUE, {x: CurrencyUtils.formatThousand(VALIDATE_PRICE.MAX)})
                }
            } else {
                if (parsedPrice < VALIDATE_PRICE.MIN) {
                    error = i18next.t(ERROR_KEY.MIN_VALUE, {x: CurrencyUtils.formatThousand(VALIDATE_PRICE.MIN)})
                } else if (parsedPrice > VALIDATE_PRICE.MAX) {
                    error = i18next.t(ERROR_KEY.MAX_VALUE, {x: CurrencyUtils.formatThousand(VALIDATE_PRICE.MAX)})
                }
            }
        }
        return error
    }
    const checkValidateRow = (data) => {
        data.every((_var, index) => {
            return validateCostPrice(_var.costPrice, index) & validateOrgPrice(_var.orgPrice, index) & validateNewPrice(_var.orgPrice, _var.costPrice, _var.newPrice, index, _var)
        })
    }

    const onChangeApplyAllValue = (e) => {
        const {value} = e.currentTarget
        if (!isNaN(value))
            setStApplyAllValue(formatCurrency(value))
    }
    const checkAllErrors = (array) => {
        return array.some(item => (item !== '' && item !== undefined))
    }

    const handleErrorDiscountPrice = (result, listData) => {
        let clonedTable = listData 
        for (const item of clonedTable) {
            const getValue = result.find(r => r.itemId === item.itemId && r.modelId === item.modelId)
            item.isMaxWholesalePrice = false
            if (getValue && getValue.status === 0) item.isMaxWholesalePrice = true
        }
        setStVariationTable(clonedTable)
    }
    const checkSalePriceForWholesale = (price, checkIndex, listData) => {
        const clonedTable = [...stVariationTable]

        let data = {
            lstData: []
        }
        if (checkIndex === 'ALL') {
            for (const {itemId, modelId} of clonedTable) { //.entries()
                // const row = clonedTable[idx]
                data.lstData.push({
                    itemId: itemId,
                    modelId: modelId ? modelId : null,
                    newPrice: price
                })
            }
        } else {
            const row = clonedTable[checkIndex]
            data.lstData.push({
                itemId: row.itemId,
                modelId: row.modelId ? row.modelId : null,
                newPrice: price
            })
        }
        ItemService.checkMaxSellingPriceForWholesale(data)
            .then(result => {
                if (result) {
                    handleErrorDiscountPrice(result, listData)
                }
            })
            .catch(err => {
                console.log(err)
            }).finally(() => {
                setStIsSaving(false)
            })
    }
    const handleApplyAllNewPrice = (data) => {
        checkSalePriceForWholesale(parseFloat(stApplyAllValue), 'ALL', data)
    }

    const onClickApplyAllValue = () => {
        // e.preventDefault()
        if (stApplyAllValue && !stApplyPriceError) {
            const clonedTable = _.cloneDeep([...stVariationTable])
            for (const row of clonedTable) {
                if (stPriceType === UPDATE_PRICE_TYPE.ORG) {
                    if (!row.deposit) row.orgPrice = parseFloat(stApplyAllValue)
                }
                if (stPriceType === UPDATE_PRICE_TYPE.NEW) {
                    row.newPrice = parseFloat(stApplyAllValue)
                }
                if (stPriceType === UPDATE_PRICE_TYPE.COST) {
                    if (!row.deposit) row.costPrice = parseFloat(stApplyAllValue)
                }
            }
            if (stPriceType === UPDATE_PRICE_TYPE.NEW) {
                handleApplyAllNewPrice(clonedTable)

            }else{
                setStVariationTable(clonedTable)
            }
            setIsDisabledBtnSave(false)
        }
    }

    const checkMinMaxInputPrice = (price) => {
        let error = ERROR_KEY.NONE
        const parsedPrice = parseFloat(price)
        if (isNaN(parsedPrice) && parsedPrice == null) return
        if (parsedPrice < VALIDATE_PRICE.MIN) {
            error = i18next.t(ERROR_KEY.MIN_VALUE, {x: CurrencyUtils.formatThousand(VALIDATE_PRICE.MIN)})
        } else if (parsedPrice > VALIDATE_PRICE.MAX) {
            error = i18next.t(ERROR_KEY.MAX_VALUE, {x: CurrencyUtils.formatThousand(VALIDATE_PRICE.MAX)})
        }
        return error
    }

    const onChangeOrgPrice = (e, index) => {
        const {value} = e.currentTarget
        const clonedTable = [...stVariationTable]
        clonedTable[index].orgPrice = formatCurrency(value)
        setStVariationTable(clonedTable)
        validateOrgPrice(clonedTable[index].orgPrice, index)
        setIsDisabledBtnSave(false)
    }

    const checkValidateNewPrice = (orgPrice, costPrice, newPrice) => {
        let error = '';
        if (parseFloat(newPrice) > parseFloat(orgPrice)) {
            error = i18next.t(ERROR_KEY.MAX_VALUE, {x: CurrencyUtils.formatThousand(orgPrice)})
        } else if (parseFloat(newPrice) < parseFloat(costPrice)) {
            error = i18next.t(ERROR_KEY.MIN_VALUE, {x: CurrencyUtils.formatThousand(costPrice)})
        } else {
            error = checkMinMaxInputPrice(newPrice)
        }
        return error;
    }

    const validateNewPrice = (orgPrice, costPrice, newPrice, index, item) => {
        let error = checkValidateNewPrice(orgPrice, costPrice, newPrice);
        if(item.isMaxWholesalePrice) {
            error = i18next.t('component.wholesalePrice.error.wholesale_price_higher_sale_price')
        }
        setStNewPriceErrors(errors => {
            errors[index] = error
            return [...errors]
        })
        return !error
    }

    const onChangeNewPrice = (e, index) => {
        const {value} = e.currentTarget
        const clonedTable = [...stVariationTable]
        if(clonedTable[index].newPrice === value){
            return
        }
        setStIsSaving(true)
        //BH-5173 if new price = 0, set to default value is org price
        if (!value || value === 0) {
            clonedTable[index].newPrice = clonedTable[index].orgPrice;
        } else {
            clonedTable[index].newPrice = formatCurrency(value)
        }
        checkSalePriceForWholesale(parseFloat(value), index, clonedTable)
        setIsDisabledBtnSave(false)
    }

    const onChangeCostPrice = (e, index) => {
        const {value} = e.currentTarget
        const clonedTable = [...stVariationTable]
        //BH-5173 if new price = 0, set to default value is org price
        if (!value || value === 0) {
            clonedTable[index].costPrice = clonedTable[index].orgPrice;
        } else {
            clonedTable[index].costPrice = formatCurrency(value)
        }
        setStVariationTable(clonedTable)
        validateCostPrice(clonedTable[index].costPrice, index)
        setIsDisabledBtnSave(false)
    }

    const formatCurrency = (input) => {
        return input.toString().replace(/[,]/g, '');
    }

    const validateCostPrice = (costPrice, index) => {
        let error = ''

        const price = stVariationTable[index].newPrice
        const parsedPrice = parseFloat(costPrice)
        if (parsedPrice < 0) {
            error = i18next.t(ERROR_KEY.MIN_VALUE, {x: 0})
        } else {
            if (parsedPrice > VALIDATE_PRICE.MAX) {
                error = i18next.t(ERROR_KEY.MAX_VALUE, {x: CurrencyUtils.formatThousand(VALIDATE_PRICE.MAX)})
            } else {
                if (parseFloat(costPrice) > parseFloat(price)) {
                    error = i18next.t(ERROR_KEY.EQUAL_LOWER_COST_PRICE, {x: CurrencyUtils.formatThousand(price)})
                }
            }
        }
        setStCostPriceErrors(errors => {
            errors[index] = error
            return [...errors]
        })
        return !error
    }

    const validateOrgPrice = (orgPrice, index) => {
        let error = checkMinMaxInputPrice(orgPrice)
        // const price = stVariationTable[index].newPrice
        // if (parseFloat(orgPrice) < parseFloat(price)) {
        //     error = i18next.t(ERROR_KEY.EQUAL_HIGHER_ORG_PRICE, {x: CurrencyUtils.formatThousand(price)})
        // }
        setStOrgPriceErrors(errors => {
            errors[index] = error

            return [...errors]
        })
        return !error
    }
    const checkAllPriceErrors = (array) => {
        return array.some(item => (item !== '' && item !== undefined))
    }

    const onSave = () => {
        // e.preventDefault()
        let request = {
            lstData: []
        }
        if (checkAllPriceErrors(stOrgPriceErrors) || checkAllPriceErrors(stNewPriceErrors) || checkAllPriceErrors(stCostPriceErrors)) return

        const dataTable = []
        for (const {
            costPrice,
            deposit,
            id,
            itemId,
            itemName,
            modelId,
            modelName,
            newPrice,
            orgPrice
        } of stVariationTable) {
            let dataRow = {
                costPrice: parseFloat(costPrice),
                deposit: deposit,
                id: id,
                itemName: itemName,
                itemId: itemId,
                modelId: modelId,
                modelName: modelName,
                newPrice: parseFloat(newPrice),
                orgPrice: parseFloat(orgPrice)
            }
            dataTable.push(dataRow)
        }
        request.lstData = dataTable
        setStIsSaving(true)
        ItemService.updateListPriceByMultipleItem(request)
            .then(() => {
                // GSToast.commonUpdate()
            })
            .catch(() => {
                GSToast.commonError()
            })
            .finally(() => {
                setStIsSaving(false)
                if (props.onSave) props.onSave()
            })
    }

    return (
        <Modal isOpen={props.isOpen} id="multi-price" className="multi-price product-variation-price-editor-modal"
               size="lg" key={props.isOpen}>
            {stIsSaving && <LoadingScreen zIndex={9999} loadingStyle={LoadingStyle.ELLIPSIS_GREY}/>}
            <ModalHeader toggle={props.onCancel}>
                <GSTrans t="page.product.updatePriceModal.title"/>
            </ModalHeader>
            <ModalBody>
                <AvForm>
                    <div className="d-flex align-items-center product-variation-price-editor-modal__apply-all-wrapper">
                        <UikSelect
                            defaultValue={stPriceType}
                            options={[
                                {
                                    label: i18next.t("component.product.addNew.pricingAndInventory.price"),
                                    value: UPDATE_PRICE_TYPE.ORG
                                },
                                {
                                    label: i18next.t("component.product.addNew.pricingAndInventory.discountPrice"),
                                    value: UPDATE_PRICE_TYPE.NEW
                                },
                                {
                                    label: i18next.t("component.product.addNew.pricingAndInventory.costPrice"),
                                    value: UPDATE_PRICE_TYPE.COST
                                }
                            ]}
                            className="mr-2 product-variation-price-editor-modal__select-price-type"
                            onChange={({label, value}) => setStPriceType(value)}
                        />
                        <div className='product-variation-price-editor-modal__apply-price'>
                            <AvFieldCurrency name={"apply-all"}
                                             parentClassName={stApplyPriceError ? "cur-input--error" : ''}
                                             unit={CurrencyUtils.getLocalStorageSymbol()}
                                             value={stApplyAllValue}
                                             onBlur={(e) => onChangeApplyAllValue(e)}
                                             position={CurrencyUtils.isPosition(CurrencyUtils.getLocalStorageSymbol())}
                                             precision={CurrencyUtils.isCurrencyInput(CurrencyUtils.getLocalStorageSymbol()) ? '2' : '0'}
                                             decimalScale={CurrencyUtils.isCurrencyInput(CurrencyUtils.getLocalStorageSymbol()) ? 2 : 0}
                            />
                            <span className='cur-text--error'>{stApplyPriceError}</span>
                        </div>

                        <GSButton primary marginLeft onClick={() => onClickApplyAllValue()}>
                            <GSTrans t={"component.product.addNew.stock.applyAll"}/>
                        </GSButton>
                    </div>
                    <div className="mt-5 product-variation-price-editor-modal__table-wrapper gs-atm__scrollbar-2">
                        {stVariationTable && stVariationTable.length > 0 &&
                        <table className="product-variation-price-editor-modal__table w-100 gsa-border-color--gray"
                               border="1px">
                            <thead>
                                <tr>
                                    <th>
                                        <GSTrans t="component.button.selector.searchType.productName"/>
                                    </th>
                                    <th>
                                        <GSTrans t={"component.product.addNew.pricingAndInventory.costPrice"}/>
                                    </th>
                                    <th>
                                        <GSTrans t={"component.product.addNew.pricingAndInventory.discountPrice"}/>
                                    </th>
                                    <th>
                                        <GSTrans t={"component.product.addNew.pricingAndInventory.price"}/>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                            {stVariationTable.map((item, index) => (
                                <tr key={index}>
                                    <td>
                                        <div className='d-flex flex-column align-items-center justify-content-start'>
                                            <div className="w-100 text-left">{item.itemName}</div>
                                            <div className="w-100 text-left">
                                                <small className="text-secondary">
                                                    {item.modelName}
                                                </small>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="wrapper">
                                            <GSComponentTooltip
                                                placement={GSComponentTooltipPlacement.TOP}
                                                interactive
                                                className={'d-inline'}
                                                disabled={!item.deposit}
                                                html={
                                                    <GSTrans
                                                        t="component.multiUpdatePrice.onlyUpdatePriceSaleForDepositProduct"
                                                    >
                                                    </GSTrans>
                                                }
                                            >
                                                <AvFieldCurrency className="input-min-width"
                                                                 parentClassName={stCostPriceErrors[index] ? "cur-input--error" : ''}
                                                                 name={index + '-costPrice'}
                                                                 disabled={item.deposit}
                                                                 value={item.costPrice}
                                                                 unit={CurrencyUtils.getLocalStorageSymbol()}
                                                                 onBlur={(e) => onChangeCostPrice(e, index)}
                                                                 position={CurrencyUtils.isPosition(CurrencyUtils.getLocalStorageSymbol())}
                                                                 precision={CurrencyUtils.isCurrencyInput(CurrencyUtils.getLocalStorageSymbol()) ? '2' : '0'}
                                                                 decimalScale={CurrencyUtils.isCurrencyInput(CurrencyUtils.getLocalStorageSymbol())  ? 2 : 0}
                                                />
                                            </GSComponentTooltip>
                                            <span className='cur-text--error'
                                                  key={stCostPriceErrors[index]}>{stCostPriceErrors[index]}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className='wrapper'>
                                            <AvFieldCurrency className="input-min-width"
                                                             parentClassName={stNewPriceErrors[index] ? "cur-input--error" : ''}
                                                             name={index + '-newPrice'}
                                                             value={item.newPrice}
                                                             unit={CurrencyUtils.getLocalStorageSymbol()}
                                                             onChange={(e) => onChangeNewPrice(e, index)}
                                                             position={CurrencyUtils.isPosition(CurrencyUtils.getLocalStorageSymbol())}
                                                             precision={CurrencyUtils.isCurrencyInput(CurrencyUtils.getLocalStorageSymbol()) ? '2' : '0'}
                                                             decimalScale={CurrencyUtils.isCurrencyInput(CurrencyUtils.getLocalStorageSymbol()) ? 2 : 0}

                                            />
                                            <span className='cur-text--error'
                                                  key={stNewPriceErrors[index]}>{stNewPriceErrors[index]}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="wrapper">
                                            <GSComponentTooltip
                                                placement={GSComponentTooltipPlacement.TOP}
                                                interactive
                                                className={'d-inline'}
                                                disabled={!item.deposit}
                                                html={
                                                    <GSTrans
                                                        t="component.multiUpdatePrice.onlyUpdatePriceSaleForDepositProduct"
                                                    >
                                                    </GSTrans>
                                                }
                                            >
                                                <AvFieldCurrency className="input-min-width"
                                                                 parentClassName={stOrgPriceErrors[index] ? "cur-input--error" : ''}
                                                                 name={index + '-orgPrice'}
                                                                 disabled={item.deposit}
                                                                 value={item.orgPrice}
                                                                 unit={CurrencyUtils.getLocalStorageSymbol()}
                                                                 onBlur={(e) => onChangeOrgPrice(e, index)}
                                                                 position={CurrencyUtils.isPosition(CurrencyUtils.getLocalStorageSymbol())}
                                                                 precision={CurrencyUtils.isCurrencyInput(CurrencyUtils.getLocalStorageSymbol()) ? '2' : '0'}
                                                                 decimalScale={CurrencyUtils.isCurrencyInput(CurrencyUtils.getLocalStorageSymbol())  ? 2 : 0}
                                                />
                                            </GSComponentTooltip>
                                            <span className='cur-text--error'
                                                  key={stOrgPriceErrors[index]}>{stOrgPriceErrors[index]}</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                        }
                    </div>
                    {stIsFetching &&
                    <Loading style={LoadingStyle.DUAL_RING_GREY}/>
                    }
                </AvForm>
            </ModalBody>

            <ModalFooter>
                <div className='d-flex flex-column justify-content-center align-items-center'>
                    {disabledUpdatePrice && (
                        <div className='text-center'>
                            <strong><GSTrans t={"common.txt.notes"}/></strong>{' '}
                            <GSTrans t={"component.productList.update.price.notice"}/>
                        </div>
                    )}
                    <div className='d-flex mt-3'>
                        <GSButton secondary outline marginRight onClick={props.onCancel}>
                            <GSTrans t={"common.btn.cancel"}/>
                        </GSButton>
                        <GSButton success onClick={() => onSave()} disabled={isDisabledBtnSave}>
                            <GSTrans t={"common.btn.update"}/>
                        </GSButton>
                    </div>
                </div>
            </ModalFooter>
        </Modal>
    );
}
UpdateProductPrice.propTypes = {
    isOpen: PropTypes.bool,
    item: PropTypes.array,
    onCancel: PropTypes.func,
    onSave: PropTypes.func,
};
export default UpdateProductPrice;
