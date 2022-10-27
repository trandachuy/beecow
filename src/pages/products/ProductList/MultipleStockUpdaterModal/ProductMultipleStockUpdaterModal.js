/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 11/11/2020
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React, {useEffect, useRef, useState} from 'react';
import PropTypes from 'prop-types';
import './ProductMultipleStockUpdaterModal.sass'
import Modal from 'reactstrap/es/Modal';
import ModalHeader from 'reactstrap/es/ModalHeader';
import ModalBody from 'reactstrap/es/ModalBody';
import ModalFooter from 'reactstrap/es/ModalFooter';
import {AvForm} from 'availity-reactstrap-validation'
import GSButton from '@shared/GSButton/GSButton';
import GSTrans from '@shared/GSTrans/GSTrans';
import AvFieldCurrency from '@shared/AvFieldCurrency/AvFieldCurrency';
import {CurrencySymbol} from '@shared/form/CryStrapInput/CryStrapInput';
import {FormValidate} from '@config/form-validate';
import {NumberUtils} from '@utils/number-format';
import AlertInline, {AlertInlineType} from '@shared/AlertInline/AlertInline';
import i18next from 'i18next';
import {InventoryEnum} from '../../InventoryList/InventoryEnum';
import {cn} from '@utils/class-name';
import {ItemUtils} from '@utils/item-utils';
import {ItemService} from '@services/ItemService';
import DropdownBox from '@shared/GSCallHistoryTable/SearchDropdown/DropdownBox';
import Loading, {LoadingStyle} from '@components/shared/Loading/Loading';
import DragToScroll from '@shared/DragToScroll/DragToScroll';
import {GSToast} from '@utils/gs-toast';
import LoadingScreen from '@shared/LoadingScreen/LoadingScreen';
import * as Styled from './ProductMultipleStockUpdaterModal.styled'

const ERROR_KEY = {
    NO_BRANCH: 'page.product.updateStockModal.emptyBranch',
    NEGATIVE_STOCK: 'page.product.updateStockModal.negativeStock',
    OVER_STOCK: 'page.product.updateStockModal.overStock',
    NONE: ''
}

/**
 * @typedef {Object} DataTableRow
 * @property {String} id
 * @property {Number} itemId
 * @property {Number} modelId
 * @property {Number} currentStock
 * @property {Number} newStock
 * @property {String} itemName
 * @property {String} modelName
 */


const ProductMultipleStockUpdaterModal = props => {
    const [stUpdateStockType, setStUpdateStockType] = useState(InventoryEnum.ACTIONS.CHANGE_STOCK);
    const [stDataTable, setStDataTable] = useState([]);
    const [stSelectedBranch, setStSelectedBranch] = useState(null);
    const [stStockChange, setStStockChange] = useState('');
    const [stError, setStError] = useState(ERROR_KEY.NONE);
    const [stPressed, setStPressed] = useState(false);
    const [stInventory, setStInventory] = useState([]);

    const [stIsFetching, setStIsFetching] = useState(true);
    const [stIsSaving, setStIsSaving] = useState(false);

    useEffect(() => {
        if (props.isOpen) {
            setStIsFetching(true)
            ItemService.getMultipleItemInventory(props.items.map(item => item.id))
                .then(result => {
                    let combinedInventory = []
                    for (const { inventories, itemId } of result.lstData) {
                        combinedInventory = [...combinedInventory, ...inventories]
                    }
                    setStInventory(combinedInventory)
                    if (props.branchList && props.branchList.length > 0) {
                        setStSelectedBranch(props.branchList[0])
                    }
                })
                .finally(() => {
                    setStIsFetching(false)
                })

        } else {
            // reset
            setStStockChange('')
            setStUpdateStockType(InventoryEnum.ACTIONS.CHANGE_STOCK)
            setStSelectedBranch(null)
            setStDataTable([])
        }
    }, [props.isOpen]);

    useEffect(() => {
        if (stInventory.length > 0 && props.branchList) {
            setStSelectedBranch(props.branchList[0])
        }
    }, [props.branchList, stInventory]);

    useEffect(() => {
        // let itemNameDirectory = {}
        // for (const {id, name, models} of props.items) {
        //     if (models.length > 0) {
        //         for (const model of models) {
        //             const combinedId = id + '-' + model.id
        //             itemNameDirectory[combinedId] = {
        //                 itemName: name,
        //                 modelName: model.orgName
        //             }
        //         }
        //     } else {
        //         itemNameDirectory[id] = {
        //             itemName: name
        //         }
        //     }
        // }
        // refItemNameDirectory.current = itemNameDirectory
    }, [props.items]);


    useEffect(() => {
        if (stSelectedBranch) {
            fetchDataTableByBranch(stSelectedBranch.value)
        }
    }, [stSelectedBranch]);

    useEffect(() => {
        if (stDataTable && stDataTable.length > 0) {
            isValid()
        }
    }, [stDataTable]);

    useEffect(() => {
        updateWholeStock()
    }, [stStockChange, stUpdateStockType]);

    const updateWholeStock = (dataTableObj) => {
        /**
         * @type {DataTableRow[]}
         */
        if (stStockChange !== undefined && stStockChange !== '' && stStockChange !== null) {
            let dataTable = dataTableObj ? [...dataTableObj] : [...stDataTable]
            const changeValue = parseInt(stStockChange)
            switch (stUpdateStockType) {
                case InventoryEnum.ACTIONS.CHANGE_STOCK:
                    dataTable.forEach(row => {
                        row.newStock = row.currentStock + changeValue
                    })
                    break
                case InventoryEnum.ACTIONS.SET_STOCK:
                    dataTable.forEach(row => {
                        row.newStock = changeValue
                    })
                    break
            }
            if (dataTableObj) {
                return dataTable
            } else {
                setStDataTable(dataTable)
            }
        } else {
            if (dataTableObj) {
                return dataTableObj
            }
        }
    }

    const onSwitchMode = (e, mode) => {
        e.preventDefault()
        setStUpdateStockType(mode)
    }

    /**
     * @param {UikSelectOption} branch
     */
    const onChangeBranch = (field, branch) => {
        setStSelectedBranch(branch);
    }

    const updateLstInventory = (dataTable) => {

        return dataTable
    }

    const onStockChange = (e) => {
        let { name, value } = e.currentTarget
        setStStockChange(value)
    }

    /**
     *
     * @param event
     * @param {DataTableRow} dataRow
     */
    const onStockChangeById = (event, dataRow) => {
        /**
         * @type {DataTableRow[]}
         */
        const dataTable = [...stDataTable]
        const changeRow = dataTable.find(row => row.id === dataRow.id)
        const value = event.currentTarget.value

        changeRow.newStock = value

        setStDataTable(dataTable)
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
        // // revert unchecked row
        /**
         * @type {DataTableRow[]}
         */
        const dataTable = [...stDataTable]
        let selfChange = false
        for (const { newStock, currentStock } of dataTable) {
            if (newStock < 0) {
                if (updateState) setStError(ERROR_KEY.NEGATIVE_STOCK)
                return false
            }
            if (newStock > 1_000_000) {
                if (updateState) setStError(ERROR_KEY.OVER_STOCK)
                return false
            }

            if (newStock !== currentStock) selfChange = true
        }

        // if no change
        if (!stStockChange && !selfChange) {
            return false
        }

        if (updateState) setStError(ERROR_KEY.NONE)
        return true
    }

    const onSave = (e) => {
        e.preventDefault()

        /**
         * @param {DataTableRow} dataRow
         */
        const calculateStock = (currentStock, newStock) => {
            switch (stUpdateStockType) {
                case InventoryEnum.ACTIONS.CHANGE_STOCK: {
                    return newStock - currentStock
                }
                case InventoryEnum.ACTIONS.SET_STOCK: {
                    return newStock
                }
            }
        }

        if (isValid()) {
            /**
             * @type {InventoryMultipleItemRequest}
             */
            let request = {
                lstData: []
            }

            /**
             * @type {DataTableRow[]}
             */
            const dataTable = [...stDataTable]
            for (const { itemId, modelId, currentStock, newStock } of dataTable) {
                /**
                 * @type {InventoryDetail}
                 */
                const lstDataRow = {
                    itemId: itemId,
                    modelId: modelId,
                    action: stUpdateStockType,
                    stock: calculateStock(currentStock, newStock),
                    branchId: stSelectedBranch.value
                }
                request.lstData.push(lstDataRow)
            }

            setStIsSaving(true)
            ItemService.updateMultipleItemInventory(request)
                .then(() => {
                    // GSToast.commonUpdate()
                })
                .catch(e => {
                    GSToast.commonError()
                })
                .finally(() => {
                    setStIsSaving(false)
                    if (props.onSave) props.onSave()
                })
        }
    }

    /**
     * @param {DataTableRow} row
     * @return {JSX.Element}
     */
    const renderModelStockTransaction = (row) => {
        const renderInput = (value, onChange) => <AvFieldCurrency
            name={ 'new-stock-' + row.id }
            value={ value }
            unit={ CurrencySymbol.NONE }
            style={ {
                color: 'red'
            } }
            onChange={ (e) => onStockChangeById(e, row) }
            parentClassName={ (value < 0 || value > 1_000_000) ? 'product-multiple-branch-stock_editor_modal__input-invalid' : '' }
        />

        if (row.currentStock === row.newStock) {
            return renderInput(row.newStock)
        } else {
            return (
                <div className="d-flex justify-content-end align-items-center">
                    <span className="px-2">{ NumberUtils.formatThousand(row.currentStock) }</span>
                    <img src="/assets/images/stock-arrow.svg" alt="arrow"/>
                    { renderInput(row.newStock) }
                </div>
            )
        }
    }

    const handleStockOnKeyPress = (e) => {
        if (e.key.match(/[0-9.,]/)) { // set state if is number
            setStPressed(true)
        }
    }

    /**
     * Fetch Data table
     * @param branchId
     * @return {DataTableRow[]}
     */
    const fetchDataTableByBranch = (sBranchId) => {
        /**
         * @type {DataTableRow[]}
         */
        let dataTable = []
        for (const { itemId, modelId, remainingItem, branchId, itemName, modelName } of stInventory) {
            if (branchId !== sBranchId) continue
            //const nameObj = refItemNameDirectory.current[modelId? itemId + '-' + modelId:itemId]
            /**
             * @type {DataTableRow}
             */
            let dataRow = {
                id: modelId ? itemId + '-' + modelId : itemId,
                itemId: itemId,
                modelId: modelId,
                itemName: itemName,
                modelName: modelName,
                currentStock: remainingItem,
                newStock: remainingItem
            }
            dataTable.push(dataRow)
        }

        dataTable = updateWholeStock(dataTable)

        setStDataTable(dataTable)
    }

    const isChange = () => {
        for (const { newStock, currentStock } of stDataTable) {
            if (newStock !== currentStock) return true
        }
        return false
    }


    return (
        <Modal isOpen={ props.isOpen } className="product-multiple-stock_updater_modal" size="lg" key={ props.isOpen }>
            { stIsSaving && <LoadingScreen zIndex={ 9999 } loadingStyle={ LoadingStyle.ELLIPSIS_GREY }/> }
            {/*AVOID SUBMIT OUTER FORM*/ }
            <ModalHeader toggle={ props.onCancel }>
                <GSTrans t="page.product.create.updateStockModal.title"/>
            </ModalHeader>
            <ModalBody>
                <AvForm onSubmit={ e => e.preventDefault() } style={ { maxWidth: 630 } }>

                    <div className="d-flex flex-column flex-md-row">
                        <div className={ cn({ 'disabled': stIsFetching }) }>
                            <DropdownBox
                                defaultValue={ stSelectedBranch }
                                items={ props.branchList }
                                onSelected={ onChangeBranch }
                                className="product-multiple-stock_updater_modal__branch-select"
                                field="branch-selector"
                            />
                        </div>
                        <div className={ cn('d-flex mt-3 mt-md-0', { 'disabled': stIsFetching }) }>

                            <div className="d-flex px-md-2 pl-0 pr-2">
                                <GSButton primary
                                          outline={ stUpdateStockType !== InventoryEnum.ACTIONS.CHANGE_STOCK }
                                          onClick={ (e) => onSwitchMode(e, InventoryEnum.ACTIONS.CHANGE_STOCK) }
                                          style={ { borderRadius: '.25rem 0 0 .25rem' } }
                                >
                                    <GSTrans t="page.product.create.updateStockModal.btn.change"/>
                                </GSButton>
                                <GSButton primary
                                          outline={ stUpdateStockType !== InventoryEnum.ACTIONS.SET_STOCK }
                                          onClick={ (e) => onSwitchMode(e, InventoryEnum.ACTIONS.SET_STOCK) }
                                          style={ { borderRadius: '0 .25rem .25rem 0' } }

                                >
                                    <GSTrans t="page.product.create.updateStockModal.btn.set"/>
                                </GSButton>
                            </div>
                            <div>

                                <AvFieldCurrency name="quantity"
                                                 placeholder={ i18next.t('page.product.create.updateStockModal.quantity.placeholder') }
                                                 unit={ CurrencySymbol.NONE }
                                                 validate={ {
                                                     ...FormValidate.required(),
                                                     ...FormValidate.maxValue(1_000_000)
                                                 } }
                                                 value={ stStockChange }
                                    // onChange={onStockChange}
                                                 onValueKeyPressChange={ onStockChange }
                                                 stepper={ stUpdateStockType === InventoryEnum.ACTIONS.CHANGE_STOCK }
                                                 onKeyPress={ handleStockOnKeyPress }
                                                 parentClassName="quantity-input-field"
                                />

                            </div>
                        </div>
                    </div>
                    { stError && stError !== ERROR_KEY.NO_BRANCH &&
                        <AlertInline nonIcon textAlign={ 'left' } text={ i18next.t(stError) }
                                     type={ AlertInlineType.ERROR }/>
                    }
                    <div>
                        { stIsFetching ||
                            <div className="d-flex product-multiple-branch-stock_editor_modal__branch-table-wrapper">
                                {/*HEAD COLUMNS*/ }
                                <DragToScroll>
                                    <div className="overflow-x-auto h-fit-content w-100">
                                        <div
                                            className="product-multiple-branch-stock_editor_modal__header-table w-100 gsa-border-color--gray">
                                            <div className="thead">
                                                <div className="font-size-_8rem d-flex tr">
                                                    <div className="text-left th">
                                                        <GSTrans t="component.button.selector.searchType.productName"/>
                                                    </div>
                                                    <div className="th">
                                                        <GSTrans t="component.product.addNew.variations.title"/>
                                                    </div>
                                                </div>
                                            </div>
                                            <div>
                                                { stDataTable && stDataTable.map(
                                                    /**
                                                     * @param {DataTableRow} row
                                                     */
                                                    row => (
                                                        <div key={ row.id } className="font-size-_8rem d-flex tr">
                                                            <div className="text-left td">
                                                <span className="">
                                                    { row.itemName }
                                                </span>
                                                            </div>
                                                            <div className="text-left td">
                                                                { row.modelName ? ItemUtils.escape100Percent(row.modelName) : '' }
                                                            </div>
                                                        </div>
                                                    )) }
                                            </div>
                                        </div>
                                    </div>

                                </DragToScroll>

                                {/*CONTENT*/ }
                                <div className=" ">
                                    <div
                                        className="product-multiple-branch-stock_editor_modal__input-table w-100 gsa-border-color--gray"
                                    >
                                        <div className="thead">
                                            <div className="font-size-_8rem d-flex tr">
                                                <div className="th">
                                                    <GSTrans t="component.product.addNew.pricingAndInventory.stock"/>
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            { stDataTable && stDataTable.map(row => (
                                                <div key={ 'stock-' + row.id } className="font-size-_8rem tr">
                                                    <div className="td">
                                                        { renderModelStockTransaction(row) }
                                                    </div>
                                                </div>
                                            )) }
                                        </div>
                                    </div>
                                </div>

                            </div>

                        }

                        { stIsFetching &&
                            <Loading style={ LoadingStyle.DUAL_RING_GREY }/>
                        }
                    </div>
                    <Styled.WarnBox>
                        <GSTrans t="page.productList.updateStockWarnIMEI"/>
                    </Styled.WarnBox>
                </AvForm>

            </ModalBody>
            <ModalFooter>
                <GSButton secondary outline marginRight onClick={ props.onCancel }>
                    <GSTrans t={ 'common.btn.cancel' }/>
                </GSButton>
                <GSButton success onClick={ onSave } disabled={
                    !isValid(false) || (!stPressed && !isChange()) || stIsFetching }>
                    { props.updateLabel ? props.updateLabel : <GSTrans t={ 'common.btn.update' }/> }
                </GSButton>
            </ModalFooter>
        </Modal>
    );
};

ProductMultipleStockUpdaterModal.defaultProps = {
    selected: [],
    onChange: () => {
    }
}

ProductMultipleStockUpdaterModal.propTypes = {
    isOpen: PropTypes.bool,
    items: PropTypes.array,
    branchList: PropTypes.arrayOf(
        PropTypes.shape({
            value: PropTypes.number,
            label: PropTypes.string
        })),
    onCancel: PropTypes.func,
    onSave: PropTypes.func
};

export default ProductMultipleStockUpdaterModal;
