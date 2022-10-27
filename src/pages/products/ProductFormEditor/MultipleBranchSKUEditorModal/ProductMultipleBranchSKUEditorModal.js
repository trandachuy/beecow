/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 11/11/2020
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import './ProductMultipleBranchSKUEditorModal.sass'
import Modal from "reactstrap/es/Modal";
import ModalHeader from "reactstrap/es/ModalHeader";
import ModalBody from "reactstrap/es/ModalBody";
import ModalFooter from "reactstrap/es/ModalFooter";
import GSButton from "../../../../components/shared/GSButton/GSButton";
import GSTrans from "../../../../components/shared/GSTrans/GSTrans";
import GSDropdownMultipleSelect from "../../../../components/shared/GSDropdownMultipleSelect/GSDropdownMultipleSelect";
import AlertInline, {AlertInlineType} from "../../../../components/shared/AlertInline/AlertInline";
import i18next from "i18next";
import {InventoryEnum} from "../../InventoryList/InventoryEnum";
import Constants from "../../../../config/Constant";

const ERROR_KEY = {
    NO_BRANCH: 'page.product.updateStockModal.emptyBranch',
    NEGATIVE_STOCK: 'page.product.updateStockModal.negativeStock',
    OVER_STOCK: 'page.product.updateStockModal.overStock',
    NONE: ''
}
const ProductMultipleBranchSKUEditorModal = props => {
    const [stUpdateStockType, setStUpdateStockType] = useState(InventoryEnum.ACTIONS.CHANGE_STOCK);
    const [stDataTable, setStDataTable] = useState(props.dataTable);
    const [stSelectedBranches, setStSelectedBranches] = useState(props.selected || []);
    const [stStockChange, setStStockChange] = useState('');
    const [stError, setStError] = useState(ERROR_KEY.NONE);

    useEffect(() => {
        setStSelectedBranches(props.selected.sort((a, b) => a.id - b.id))
    }, [props.selected])

    useEffect(() => {
        if (props.dataTable) {
            setStDataTable(updateLstInventory([...props.dataTable]))
        }
    }, [props.dataTable]);


    const onChangeBranches = (branches) => {
        setStSelectedBranches(branches.sort((a, b) => a - b));
    }

    const updateLstInventory = (dataTable) => {
        const clonedDataTable = [...dataTable]
        clonedDataTable.forEach(row => {
            row.lstInventory.forEach(branch => {
                branch.orgSku = branch.sku
            })
        })
        return dataTable
    }

    const isValid = () => {
        if (stSelectedBranches.length === 0) {
            setStError(ERROR_KEY.NO_BRANCH)
            return false
        }

        setStError(ERROR_KEY.NONE)
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
                        lBranch.sku = lBranch.orgSku // revert
                })
            })


            props.onSave(dataTable)
        }
    }

    const onChangeSKU = (index, branchId, e) => {
        const {name, value} = e.currentTarget

        const clonedTable = [...stDataTable]
        const currentRow = clonedTable[index]
        const currentBranch = currentRow.lstInventory.find(b => b.branchId === branchId)
        currentBranch.sku = value

        setStDataTable(clonedTable)
    }

    const renderSkuInput = (row, branchId, index) => {
        const branch = row.lstInventory.find(ivt => ivt.branchId === branchId)
        let defaultValue = ""
        if (branch) {
            defaultValue = branch.sku
        }

        return <input className="form-control"
                      defaultValue={defaultValue}
                      maxLength={100}
                      onBlur={e => onChangeSKU(index, branchId, e)}/>
    }

    const renderProductSKU = (branchId) => {
        const row = stDataTable[0]
        if (row) {
            return renderSkuInput(row, branchId, 0)
        }
    }


        return (
        <Modal isOpen={props.isOpen} className="product-multiple-branch-sku_editor_modal" size="lg" key={props.isOpen}>
            {/*AVOID SUBMIT OUTER FORM*/}
                <ModalHeader toggle={props.onCancel}>
                    <GSTrans t="page.product.updateSkuModal.title"/>
                </ModalHeader>
                <ModalBody>
                    <div className="d-flex">
                        <div className="flex-grow-1">
                            <GSDropdownMultipleSelect
                                items={props.branchList.map(branch => (
                                    {label: branch.name, value: branch.id}
                                    ))}
                                name="branches"
                                selected={stSelectedBranches}
                                headerSelectedI18Text={"page.product.create.updateStockModal.selectedBranches"}
                                headerSelectedAllText={"page.product.create.updateStockModal.selectedBranches"}
                                className="product-multiple-branch-stock_editor_modal__mlp-select"
                                onChange={onChangeBranches}
                                position="bottomLeft"
                            />
                        </div>
                    </div>
                    {stError && stSelectedBranches.length > 0 &&
                    <AlertInline nonIcon textAlign={"left"} text={i18next.t(stError)} type={AlertInlineType.ERROR}/>
                    }
                    <div className="mt-3">
                        <div className="text-left py-2 px-3 background-color-lightgray2"  style={{maxWidth: '600px'}}>
                            <strong>
                                <span className="color-blue">
                                    {props.prodName}
                                </span>
                            </strong>
                        </div>
                        {/*HAS NO MODEL*/}
                        {props.variationLength === 0 && stSelectedBranches.length > 0 &&
                        <div
                            className="product-multiple-branch-stock_editor_modal__branch-table-wrapper overflow-y-auto">
                            <table
                                className="product-multiple-branch-stock_editor_modal__branch-table w-100 gsa-border-color--gray"
                                border="1px">
                                <tbody>
                                {stSelectedBranches.map(branchId => {
                                    const branch = props.branchList.find(b => b.id == branchId)
                                    return (
                                        <tr key={branchId}>
                                            <td className="text-left font-weight-500 w-50">
                                                {branch.name}
                                            </td>
                                            <td className="text-center font-weight-500" style={{minWidth: '50%'}}>
                                                <div className="d-flex justify-content-center align-items-center">
                                                    {renderProductSKU(branchId)}
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                                </tbody>
                            </table>
                        </div>}
                        {/*HAS MODEL*/}
                        {props.variationLength > 0 && stDataTable.length > 0 && stSelectedBranches.length > 0 &&
                        <div className="d-flex product-multiple-branch-stock_editor_modal__branch-table-wrapper">
                            {/*HEAD COLUMNS*/}
                            <div>
                                <table className="product-multiple-branch-stock_editor_modal__branch-table w-100 gsa-border-color--gray"
                                       border="1px">
                                    <thead>
                                    <tr>
                                        {stDataTable[0].label.map(label => (
                                            <th >
                                                {label === Constants.DEPOSIT_CODE.CODE? i18next.t("page.product.create.variation.deposit"):label}
                                            </th>
                                        ))}
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {stDataTable.map(row => (
                                        <tr key={row.id}>
                                            {row.name.map(name => (
                                                <td className="position-sticky left-0 background-color-white">
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
                                                <th>
                                                    {branch.name}
                                                </th>
                                            )
                                        })

                                        }
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {stDataTable.map((row, index) => (
                                        <tr key={row.id}>

                                            {stSelectedBranches.map(branchId => {
                                                return (
                                                    <td>
                                                        <div className="d-flex justify-content-center align-items-center">
                                                            {renderSkuInput(row, branchId, index)}
                                                        </div>
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
                    <GSButton success onClick={onSave} disabled={stSelectedBranches.length === 0}>
                        <GSTrans t={"common.btn.update"}/>
                    </GSButton>
                </ModalFooter>
        </Modal>
    );
};

ProductMultipleBranchSKUEditorModal.defaultProps = {
    selected: [],
    onChange: () => {},
}

ProductMultipleBranchSKUEditorModal.propTypes = {
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
            sku: PropTypes.string,
        }),)
    }),),
    variationLength: PropTypes.number,
    prodName: PropTypes.string,
    onChange: PropTypes.func,
    onSave: PropTypes.func,
};

export default ProductMultipleBranchSKUEditorModal;
