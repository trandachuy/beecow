/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 11/11/2020
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import './ProductMultipleBranchStockEditorModal.sass'
import Modal from "reactstrap/es/Modal";
import ModalHeader from "reactstrap/es/ModalHeader";
import ModalBody from "reactstrap/es/ModalBody";
import ModalFooter from "reactstrap/es/ModalFooter";
import {AvForm} from "availity-reactstrap-validation"
import GSButton from "../../../../components/shared/GSButton/GSButton";
import GSTrans from "../../../../components/shared/GSTrans/GSTrans";
import AvFieldCurrency from "../../../../components/shared/AvFieldCurrency/AvFieldCurrency";
import {CurrencySymbol} from "../../../../components/shared/form/CryStrapInput/CryStrapInput";
import {FormValidate} from "../../../../config/form-validate";
import GSDropdownMultipleSelect from "../../../../components/shared/GSDropdownMultipleSelect/GSDropdownMultipleSelect";
import {CurrencyUtils, NumberUtils} from "../../../../utils/number-format";
import AlertInline, {AlertInlineType} from "../../../../components/shared/AlertInline/AlertInline";
import i18next from "i18next";
import {InventoryEnum} from "../../InventoryList/InventoryEnum";
import Constants from "../../../../config/Constant";
import {cn} from "../../../../utils/class-name";
import {ItemUtils} from "../../../../utils/item-utils";

const ERROR_KEY = {
    NO_BRANCH: 'page.product.updateStockModal.emptyBranch',
    NEGATIVE_STOCK: 'page.product.updateStockModal.negativeStock',
    OVER_STOCK: 'page.product.updateStockModal.overStock',
    NONE: ''
}
const ProductMultipleBranchStockEditorModal = props => {
    const [stUpdateStockType, setStUpdateStockType] = useState(InventoryEnum.ACTIONS.CHANGE_STOCK);
    const [stDataTable, setStDataTable] = useState(props.dataTable);
    const [stSelectedBranches, setStSelectedBranches] = useState(props.selected);
    const [stStockChange, setStStockChange] = useState('');
    const [stError, setStError] = useState(ERROR_KEY.NONE);
    const [stInvalidBranchIds, setStInvalidBranchIds] = useState([]);
    const [stPressed, setStPressed] = useState(false);


    useEffect(() => {
        if (props.branchId && props.branchId != 'ALL') {
            setStSelectedBranches([props.branchId])

            return
        }

        setStSelectedBranches(props.selected.sort((a, b) => a.id - b.id))
    }, [props.selected, props.branchId])

    useEffect(() => {
        if (props.dataTable) {
            setStDataTable(updateLstInventory([...props.dataTable]))
        }
    }, [props.dataTable]);


    useEffect(() => {
        if (stStockChange !== undefined && stStockChange !== '' && stStockChange !== null) {
            let error = ERROR_KEY.NONE

            const clonedTable = [...stDataTable]
            let invalidBranches = [...stInvalidBranchIds]
            clonedTable.forEach(r => {
                stSelectedBranches.forEach(branchId => {
                    const branch = r.lstInventory.find(b => b.branchId === branchId)
                    let currentStock = 0
                    if (branch) {
                        currentStock = branch.stock
                    }
                    branch.updateType = stUpdateStockType
                    // eslint-disable-next-line default-case
                    switch (stUpdateStockType) {
                        case InventoryEnum.ACTIONS.CHANGE_STOCK:
                            branch.newStock = currentStock + parseInt(stStockChange)
                            break
                        case InventoryEnum.ACTIONS.SET_STOCK:
                            branch.newStock = parseInt(stStockChange)
                            break
                    }

                    if (error === ERROR_KEY.NONE) {
                        if (branch.newStock < 0) {
                            error =  ERROR_KEY.NEGATIVE_STOCK
                        }
                        if (branch.newStock > 1_000_000) {
                            error = ERROR_KEY.OVER_STOCK
                        }
                    }

                    if (branch.newStock < 0 || branch.newStock > 1_000_000) {
                        invalidBranches.push(branchId)
                    } else {
                        invalidBranches = invalidBranches.filter(bId => bId !== branchId)
                    }
                })


            })

            setStInvalidBranchIds(invalidBranches)
            setStError(error)

            setStDataTable(clonedTable)
        } else {
            setStInvalidBranchIds([])

        }


    }, [stStockChange, stUpdateStockType, stSelectedBranches])

    const onSwitchMode = (e, mode) => {
        e.preventDefault()
        setStUpdateStockType(mode)
    }

    const onChangeBranches = (branches) => {
        setStSelectedBranches(branches.sort((a, b) => a - b));
    }

    const updateLstInventory = (dataTable) => {

        return dataTable
    }

    const onStockChange = (e) => {
        let {name, value} = e.currentTarget
        setStStockChange(value)

    }

    const resolveUpdatedStock = (branchId) => {
        /**
         *  @type {ItemModel}
         */
        const orgItem = props.item;
        let currentStock
        if (props.variationLength && props.variationLength > 0) { // has model -> get lstInventory from model
            const branch = orgItem.models.lstInventory.find(inventory => inventory.branchId === branchId)
            if (branch) {
                currentStock = branch.inventoryCurrent
            }
        } else { // has no model -> get lstInventory from item
            const branch = orgItem.lstInventory.find(inventory => inventory.branchId === branchId)
            if (branch) {
                currentStock = branch.inventoryCurrent
            }
        }

        //todo invoke onchange when update stock
        props.onChange()
    }

    const isValid = (updateState = true) => {
        // revert unchecked row
        const dataTable = [...stDataTable]
        dataTable.forEach(row => {
            row.lstInventory.forEach(lBranch => {
                if (!stSelectedBranches.includes(lBranch.branchId))
                    lBranch.newStock = lBranch.stock // revert
            })
        })


        if (stSelectedBranches.length === 0) {
            if (updateState) setStError(ERROR_KEY.NO_BRANCH)
            return false
        }

        for (const row of dataTable) {
            for (const branch of row.lstInventory) {
                if (branch.newStock < 0) {
                    if (updateState) setStError(ERROR_KEY.NEGATIVE_STOCK)
                    return false
                }
                if (branch.newStock > 1_000_000) {
                    if (updateState) setStError(ERROR_KEY.OVER_STOCK)
                    return false
                }
            }
        }

        if (!stStockChange) {
            return false
        }

        if (updateState) setStError(ERROR_KEY.NONE)
        return true
    }

    const onSave = (e) => {
        e.preventDefault()
        if (isValid()) {

            // revert unchecked row
            const dataTable = [...stDataTable]
                dataTable.forEach(row => {
                    row.lstInventory.forEach(lBranch => {
                        if (!stSelectedBranches.includes(lBranch.branchId))
                            lBranch.newStock = lBranch.stock // revert
                        })
                })
            props.onSave(stStockChange, stUpdateStockType, dataTable)
        }
    }

    const renderModelStockTransaction = (row, branchId) => {
        const branch = row.lstInventory.find(ivt => ivt.branchId === branchId)
        if (branch) {
            if (branch.stock === branch.newStock) {
                return <span className="text-center">{NumberUtils.formatThousand(branch.stock)}</span>
            } else {
                return (
                    <>
                        <span className="px-2">{NumberUtils.formatThousand(branch.stock)}</span>
                        <img src="/assets/images/stock-arrow.svg" alt="arrow"/>
                        <span className="px-2"
                              style={{
                                  color: (branch.newStock < 0 || branch.newStock > 1_000_000)? 'red':'black'
                              }}>{NumberUtils.formatThousand(branch.newStock)}</span>
                    </>
                )
            }
        }
    }

    const renderProductStockTransaction = (branchId) => {


        const row = stDataTable[0]
        if (row) {
            return renderModelStockTransaction(row, branchId)
        }

    }

    const handleStockOnKeyPress = (e) => {
        if (e.key.match(/[0-9.,]/)) { // set state if is number
            setStPressed(true)
        }
    }


    return (
        <Modal isOpen={props.isOpen} className="product-multiple-branch-stock_editor_modal" size="lg" key={props.isOpen}>
            {/*AVOID SUBMIT OUTER FORM*/}
                <ModalHeader toggle={props.onCancel}>
                    <GSTrans t="page.product.create.updateStockModal.title"/>
                </ModalHeader>
                <ModalBody>
                    <div className="d-flex flex-column flex-md-row">
                        <div>
                            <GSDropdownMultipleSelect
                                items={props.branchList.map(branch => (
                                    {label: branch.name, value: branch.id}
                                    ))}
                                name="branches"
                                selected={props.branchId && props.branchId != 'ALL' ? [props.branchId] : stSelectedBranches}
                                headerSelectedI18Text={"page.product.create.updateStockModal.selectedBranches"}
                                headerSelectedAllText={"page.product.create.updateStockModal.selectedBranches"}
                                className="product-multiple-branch-stock_editor_modal__mlp-select"
                                onChange={onChangeBranches}
                                position="bottomLeft"
                            />
                        </div>
                        <div className="d-flex mt-3 mt-md-0">
                            <div className="d-flex px-md-2 pl-0 pr-2">
                                <GSButton primary
                                          outline={stUpdateStockType !== InventoryEnum.ACTIONS.CHANGE_STOCK}
                                          onClick={(e) => onSwitchMode(e, InventoryEnum.ACTIONS.CHANGE_STOCK)}
                                          style={{borderRadius: ".25rem 0 0 .25rem"}}
                                          disabled={stSelectedBranches.length === 0}
                                >
                                    <GSTrans t="page.product.create.updateStockModal.btn.change"/>
                                </GSButton>
                                <GSButton primary
                                          outline={stUpdateStockType !== InventoryEnum.ACTIONS.SET_STOCK}
                                          onClick={(e) => onSwitchMode(e, InventoryEnum.ACTIONS.SET_STOCK)}
                                          style={{borderRadius: "0 .25rem .25rem 0"}}
                                          disabled={stSelectedBranches.length === 0}

                                >
                                    <GSTrans t="page.product.create.updateStockModal.btn.set"/>
                                </GSButton>
                            </div>
                            <div>
                                <AvForm onSubmit={e => e.preventDefault()}>

                                    <AvFieldCurrency name="quantity"
                                                     placeholder={i18next.t('page.product.create.updateStockModal.quantity.placeholder')}
                                                     unit={CurrencySymbol.NONE}
                                                     validate={{
                                                         ...FormValidate.required(),
                                                         ...FormValidate.maxValue(1_000_000)
                                                     }}
                                                     value={stStockChange}
                                        // onChange={onStockChange}
                                                     onValueKeyPressChange={onStockChange}
                                                     stepper={stUpdateStockType === InventoryEnum.ACTIONS.CHANGE_STOCK}
                                                     onKeyPress={handleStockOnKeyPress}
                                                     parentClassName="quantity-input-field"
                                                     precision={'0'}
                                                     decimalScale={0}
                                    />
                                </AvForm>
                            </div>

                        </div>
                    </div>
                    {stError && stError !== ERROR_KEY.NO_BRANCH &&
                    <AlertInline nonIcon textAlign={"left"} text={i18next.t(stError)} type={AlertInlineType.ERROR}/>
                    }
                    <div>
                        <div className="text-left py-2 px-3 background-color-lightgray2" style={{maxWidth: '600px'}}>
                            <strong>
                                <GSTrans t={`page.product.create.updateStockModal.btn.${stUpdateStockType.toLowerCase()}`}/>{': '}
                                <span className="color-blue">
                                    {ItemUtils.escape100Percent(props.prodName)}
                                </span>
                            </strong>
                        </div>
                        {/*HAS NO MODEL*/}
                        {props.variationLength === 0 && stSelectedBranches.length > 0 &&
                        <div
                            className="d-flex product-multiple-branch-stock_editor_modal__branch-table-wrapper">
                            <table
                                className="product-multiple-branch-stock_editor_modal__branch-table w-100 gsa-border-color--gray"
                                border="1px">
                                <tbody>
                                {stSelectedBranches.map(branchId => {
                                    const branch = props.branchList.find(b => b.id == branchId)
                                    return (
                                        <tr key={branchId}>
                                            <td className={cn("text-left font-weight-500 w-50", {'color-red': stInvalidBranchIds.includes(branchId)})}>
                                                {branch?.name}
                                            </td>
                                            <td className="text-center font-weight-500" style={{minWidth: '50%'}}>
                                                {renderProductStockTransaction(branchId)}
                                            </td>
                                        </tr>
                                    )
                                })}
                                </tbody>
                            </table>
                        </div>}
                        {/*HAS MODEL*/}
                        {props.variationLength > 0 && stDataTable.length > 0  && stDataTable[0].label &&  stSelectedBranches.length > 0 &&
                        <div className="d-flex product-multiple-branch-stock_editor_modal__branch-table-wrapper">
                            {/*HEAD COLUMNS*/}
                            <div>
                                <table className="product-multiple-branch-stock_editor_modal__branch-table w-100 gsa-border-color--gray"
                                       border="1px">
                                    <thead>
                                    <tr>
                                        {stDataTable[0].label.map(label => (
                                            <th>
                                                {label === Constants.DEPOSIT_CODE.CODE? i18next.t("page.product.create.variation.deposit"):label}
                                            </th>
                                        ))}
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {stDataTable.map(row => (
                                        <tr key={Math.random()}>
                                            {row.name.map(name => (name &&
                                                <td className=" left-0 background-color-white">
                                                    {name}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="overflow-x-auto h-fit-content">
                                <table
                                    className="product-multiple-branch-stock_editor_modal__branch-table w-100 gsa-border-color--gray"
                                    border="1px">
                                    <thead>
                                    <tr>
                                        {stSelectedBranches.map(branchId => {
                                            const branch = props.branchList.find(b => b.id == branchId)

                                            return (
                                                <th className={cn({'color-red': stInvalidBranchIds.includes(branchId)})}>
                                                    {branch?.name}
                                                </th>
                                            )
                                        })

                                        }
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {stDataTable.map(row => (
                                        <tr key={Math.random()}>

                                            {stSelectedBranches.map(branchId => {
                                                return (
                                                    <td>
                                                        {renderModelStockTransaction(row, branchId)}
                                                    </td>
                                                )
                                            })

                                            }
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>

                        </div>}

                        {stSelectedBranches.length === 0 &&
                            <AlertInline type={AlertInlineType.ERROR}
                                         text={i18next.t("component.RemainingSoldItemModal.error.noBranch")}
                                         nonIcon
                                         className="my-4"
                            />
                        }
                    </div>
                </ModalBody>
                <ModalFooter>
                    <GSButton secondary outline marginRight onClick={props.onCancel}>
                        <GSTrans t={"common.btn.cancel"}/>
                    </GSButton>
                    <GSButton success onClick={onSave} disabled={!isValid(false) && !stPressed}>
                        {props.updateLabel?  props.updateLabel:<GSTrans t={"common.btn.update"}/>}
                    </GSButton>
                </ModalFooter>
        </Modal>
    );
};

ProductMultipleBranchStockEditorModal.defaultProps = {
    selected: [],
    onChange: () => {},
}

ProductMultipleBranchStockEditorModal.propTypes = {
    isOpen: PropTypes.bool,
    item: PropTypes.object,
    mode: PropTypes.string,
    branchList: PropTypes.arrayOf(
        PropTypes.shape({
        id: PropTypes.number,
        address: PropTypes.string,
        branchStatus: PropTypes.string,
        branchType: PropTypes.string,
        city: PropTypes.string,
        code: PropTypes.string,
        createdBy: PropTypes.string,
        createdDate: PropTypes.string,
        district: PropTypes.string,
        email: PropTypes.string,
        expiryDate: PropTypes.string,
        isDefault: PropTypes.bool,
        lastModifiedBy: PropTypes.string,
        lastModifiedDate: PropTypes.string,
        name: PropTypes.string,
        phoneNumberFirst: PropTypes.string,
        phoneNumberSecond: PropTypes.string,
        status: PropTypes.bool,
        storeId: PropTypes.number,
        ward: PropTypes.string
    }),),
    onCancel: PropTypes.func,
    selected: PropTypes.array,
    dataTable: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.number,
        name: PropTypes.string,
        index: PropTypes.number,
        label: PropTypes.array,
        lstInventory: PropTypes.arrayOf(PropTypes.shape({
            branchId: PropTypes.number,
            stock: PropTypes.number,
            newStock: PropTypes.number,
            updateType: PropTypes.string,
        }),)
    }),),
    variationLength: PropTypes.number,
    prodName: PropTypes.string,
    onChange: PropTypes.func,
    onSave: PropTypes.func,
    updateLabel: PropTypes.string,
    branchId:PropTypes.number
};

export default ProductMultipleBranchStockEditorModal;
