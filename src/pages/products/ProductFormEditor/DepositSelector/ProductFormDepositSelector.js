/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 29/04/2020
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React, {useEffect, useImperativeHandle, useRef, useState} from 'react';
import './ProductFormDepositSelector.sass'
import GSButton from "../../../../components/shared/GSButton/GSButton";
import GSTags from "../../../../components/shared/form/GSTags/GSTags";
import AvFieldCountable from "../../../../components/shared/form/CountableAvField/AvFieldCountable";
import {FormValidate} from "../../../../config/form-validate";
import GSTrans from "../../../../components/shared/GSTrans/GSTrans";
import PropTypes from 'prop-types'
import i18next from "i18next";
import GSTable from "../../../../components/shared/GSTable/GSTable";
import {UikCheckbox} from "../../../../@uik";
import AvFieldCurrency from "../../../../components/shared/AvFieldCurrency/AvFieldCurrency";
import {CurrencySymbol} from "../../../../components/shared/form/CryStrapInput/CryStrapInput";
import {AvField} from 'availity-reactstrap-validation'
import GSActionButton, {GSActionButtonIcons} from "../../../../components/shared/GSActionButton/GSActionButton";
import {ProductFormEditorMode} from "../ProductFormEditor";
import AlertInline, {AlertInlineType} from "../../../../components/shared/AlertInline/AlertInline";
import GSImg from "../../../../components/shared/GSImg/GSImg";
import GSModalUploadImage from "../../../../components/shared/GSModal/GSModalUploadImage/GSModalUploadImage";
import GSFakeLink from "../../../../components/shared/GSFakeLink/GSFakeLink";
import GSDropDownButton, {GSDropdownItem} from "../../../../components/shared/GSButton/DropDown/GSDropdownButton";
import Constants from "../../../../config/Constant";
import ProductVariationPriceEditorModal from "../VaritionPriceEditorModal/ProductVariationPriceEditorModal";
import ProductMultipleBranchSKUEditorModal from "../MultipleBranchSKUEditorModal/ProductMultipleBranchSKUEditorModal";
import ProductMultipleBranchStockEditorModal
    from "../MultipleBranchStockEditorModal/ProductMultipleBranchStockEditorModal";
import {InventoryEnum} from "../../InventoryList/InventoryEnum";
import {CurrencyUtils, NumberUtils} from "../../../../utils/number-format";
import {ItemService} from "../../../../services/ItemService";
import {ItemUtils} from "../../../../utils/item-utils";
import {ImageUtils} from '../../../../utils/image';

const DEFAULT_NAME = 'GoMua'
const MAX_ROW = 50
const DEPOSIT_CODE = '[d3p0s1t]'
const ONE_H_PERCENT = '[100P3rc3nt]'
const UPDATE_TYPE_ENUM = {
    STOCK: 'STOCK',
    SKU: 'SKU',
    PRICE: 'PRICE',
}
const ProductFormDepositSelector = (props, ref) => {
    const refUploadModal = useRef(false);
    const refUpdateAllImageModal = useRef(false);
    const refTags = useRef(false);
    /**
     * [
     *  {
     *      id: number
     *      name: string,
     *      values: string[]
     *  }
     * ]
     */
    const [stVariationRow, setStVariationRow] = useState([]);
    const [stVariationTable, setStVariationTable] = useState([]);
    const [stByPassRender, setStByPassRender] = useState(false);
    const [stCurrentEditedRowIndex, setStCurrentEditedRowIndex] = useState(-1);
    const [stCheckList, setStCheckList] = useState([]);
    const [stShowUpdateStockModal, setStShowUpdateStockModal] = useState(false);
    const [stShowUpdateSkuModal, setStShowUpdateSkuModal] = useState(false);
    const [stShowUpdatePriceModal, setStShowUpdatePriceModal] = useState(false);
    const [stInvalidBarcode, setStInvalidBarcode] = useState([]);
    const [stDuplicatedBarcode, setStDuplicatedBarcode] = useState([]);
    const [stIsSingularSelect, setStIsSingularSelect] = useState(false);


    useImperativeHandle(
        ref,
        () => ({
            addVariation,
            isValid,
            getValue
        }),
    );

    useEffect(() => {
        let currentInvalidBarcode = new Set([...stInvalidBarcode])
        stDuplicatedBarcode.forEach(dupBarcode => currentInvalidBarcode.delete(dupBarcode)) // change all invalid to valid and re-scan
        let currentDuplicatedBarcode = new Set() // => remove all duplicated
        stVariationTable.forEach((r, idx) => {
            // found duplicate in table
            const localDuplicatedRow = stVariationTable.find((lDupBarcode, lIdx) => lDupBarcode.barcode === r.barcode && lIdx !== idx)
            if (localDuplicatedRow) {
                currentInvalidBarcode.add(r.barcode)
                currentDuplicatedBarcode.add(r.barcode)
                return
            }
            if (props.variationBarcodeList.includes(r.barcode)) {
                currentInvalidBarcode.add(r.barcode)
                currentDuplicatedBarcode.add(r.barcode)
            }
        })
        setStInvalidBarcode([...currentInvalidBarcode])
        setStDuplicatedBarcode([...currentDuplicatedBarcode])
    }, [props.variationBarcodeList])


    useEffect(() => {
        // if (stVariationRow.length > 0) {
        //     setStVariationRow(state => ([...props.variationRows, ...state]))
        // }
        // if (props.models && props.models.length > 0) {
        //     const propsVariation = props.variationRows.map(r => ({name: r.name, values: r.values}))
        //     const modelVariation = parseVariationRowFromModels().filter(r => r.name !== DEPOSIT_CODE)
        //     // if variation from model and from current is change -> refresh
        //     if (!_.isEqual(propsVariation, modelVariation)) {
        //         console.log('change refresh')
        //         refreshDataTable()
        //     } else {
        //         console.log(propsVariation, modelVariation)
        //     }
        //
        // } else {
        //     refreshDataTable()
        // }
        refreshDataTable()

    }, [props.variationRows])

    useEffect(() => {
        if (props.models && props.models.length > 0) {
            setStByPassRender(true)
        }
    }, [])

    useEffect(() => {
        if (stByPassRender) {
            mapResponseToTableData()
        }
    }, [stByPassRender])

    useEffect(() => {
        if (props.onLengthChange) {
            props.onLengthChange(stVariationRow.length)
        }
    }, [stVariationRow.length]);


    useEffect(() => {
        if (stByPassRender) {
            setStByPassRender(false)
            return
        }
        ;
        refreshDataTable()
        setStCheckList([])

    }, [stVariationRow]);


    const refreshDataTable = () => {
        if (stVariationRow.length === 0) {
            // clear table
            setStVariationTable([])
            return
        }

        const variationRow = [...props.variationRows, ...stVariationRow]


        let dataBackup = stVariationTable
        let data = []
        let orgPrice = props.price
        let price = props.discountPrice
        let stock = props.stock
        let sku = props.sku
        let foundItem
        let sumOfStock = 0


        // create table
        // if have one var
        if (variationRow.length === 1) {
            for (let [index, var1] of variationRow[0].values.entries()) {
                // if already existed -> add to array and update stock
                foundItem = dataBackup.filter((item) => item.var1 === var1 && !item.var2)
                if (foundItem.length > 0) {
                    data.push(foundItem[0])
                    sumOfStock += foundItem[0].stock

                } else {
                    // add new
                    data.push({
                        tId: var1,
                        var1: var1,
                        orgPrice: orgPrice,
                        price: orgPrice,
                        stock: stock,
                        sku: sku,
                        label: variationRow.map(r => r.name).join('|'),
                        lstInventory: ItemUtils.mapBranchesToLstInventory(props.branchList)
                    })
                    sumOfStock += stock
                }


            }
            setStVariationTable(data)
        }

        //if have two vars
        let rows = 0
        if (variationRow.length === 2) {
            for (let var1 of variationRow[0].values) {
                for (let var2 of variationRow[1].values) {
                    foundItem = dataBackup.filter((item) => item.var1 === var1 && item.var2 && item.var2 === var2 && !item.var3)
                    if (foundItem.length > 0) {
                        data.push(foundItem[0])
                        sumOfStock += foundItem[0].stock
                    } else {
                        // invalidBackup = invalidBackup.filter( inputName => inputName.chartAt(0) != (rows+1))

                        data.push({
                            tId: var1 + '-' + var2,
                            var1: var1,
                            var2: var2,
                            orgPrice: orgPrice,
                            price: orgPrice,
                            stock: stock,
                            sku: sku,
                            label: variationRow.map(r => r.name).join('|'),
                            lstInventory: ItemUtils.mapBranchesToLstInventory(props.branchList)
                        })
                        sumOfStock += stock
                    }
                    // this.isRowValid(data[data.length-1], rows+1)
                    rows++
                }
            }
            setStVariationTable(data)
        }

        rows = 0
        if (variationRow.length === 3) {

            for (let var1 of variationRow[0].values) {
                for (let var2 of variationRow[1].values) {
                    for (let var3 of variationRow[2].values) {
                        foundItem = dataBackup.filter((item) => item.var1 === var1 && item.var2 && item.var2 === var2 && item.var3 === var3)
                        if (foundItem.length > 0) {
                            data.push(foundItem[0])
                            sumOfStock += foundItem[0].stock
                        } else {

                            // invalidBackup = invalidBackup.filter( inputName => inputName.chartAt(0) != (rows+1))

                            data.push({
                                var1: var1,
                                var2: var2,
                                var3: var3,
                                orgPrice: orgPrice,
                                price: orgPrice,
                                stock: stock,
                                sku: sku,
                                label: variationRow.map(r => r.name).join('|'),
                                tId: var1 + '-' + var2 + '-' + var3,
                                lstInventory: ItemUtils.mapBranchesToLstInventory(props.branchList)
                            })
                            sumOfStock += stock
                        }
                        rows++
                    }

                }
            }
            setStVariationTable(data)
        }

    }

    const onSavePrice = (variationTable) => {
        setStVariationTable(variationTable)
        setStShowUpdatePriceModal(false)
        props.onChange()
    }


    /**
     * Convert dataTable to request body
     * @param {UpdateStockDataRowInventoryModel[]} ivtRows
     *  @return BranchInventoryModel[]
     */
    const mapInventoryToRequest = (ivtRows) => {

        return ivtRows.map(ivtRow => ({
            branchId: ivtRow.branchId,
            inventoryCurrent: ivtRow.orgStock,
            inventoryStock: ivtRow.newStock,
            inventoryType: ivtRow.updateType,
            inventoryActionType: InventoryEnum.ACTION_TYPES.FROM_CREATE_AT_ITEM_SCREEN,
            sku: ivtRow.sku
        }))
    }

    const getValue = () => {
        const label = [...props.variationRows.map(r => r.name), DEPOSIT_CODE].join('|')

        return stVariationTable.map((item, index) => {
            const id = item.id
            const combinedId = item.itemId + '-' + item.id

            let orgModel = {}
            if (props.models && props.models.length > 0) {
                orgModel = props.models.find(m => m.id === id)
                if (orgModel) {
                    orgModel = {
                        versionName: orgModel.versionName,
                        barcode: orgModel.barcode,
                        description: orgModel.description,
                        status: orgModel.status,
                        useProductDescription: orgModel.useProductDescription,
                        remaining: orgModel.remaining
                    }
                }

            }
            /**
             * @type {ModelItemModel}
             */
            const result = {
                id: item.id,
                name: item.var1 + (item.var2 ? '|' + item.var2 : '') + (item.var3 ? '|' + item.var3 : ''),
                orgPrice: item.orgPrice,
                discount: 0,
                newPrice: item.orgPrice,
                totalItem: props.mode === ProductFormEditorMode.ADD_NEW ? item.stock : (item.totalItem ? item.totalItem : 0),
                label: label,
                sku: item.sku,
                imagePosition: item.imagePosition,
                newStock: item.stock,
                ...orgModel,
                barcode: item.barcode || (item.id ? combinedId : undefined)
            }

            result.lstInventory = mapInventoryToRequest(item.lstInventory)

            return result
        })
    }

    const addVariation = () => {
        const newIndex = Date.now()
        const newVar = {
            id: newIndex,
            name: DEPOSIT_CODE,
            values: []
        }
        setStVariationRow(stVariationRow => ([...stVariationRow, newVar]))
        props.onChange()
    }

    const isValid = async () => {
        if (stVariationRow.length === 0) {
            return true
        }
        // check variation values
        const emptyVariationValues = stVariationRow.filter(r => r.values.length === 0)
        if (emptyVariationValues.length > 0) {
            refTags.current.isValid()
            return false
        }

        // check max row
        if (stVariationTable.length > MAX_ROW) {
            return false
        }

        // check invalid barcode
        let invalidBarcodeList = []
        const checkedBarcodeList = stVariationTable.filter(r => r.barcode !== '' && r.barcode !== r.id).map(r => r.barcode)
        if (checkedBarcodeList.length > 0) { // has barcode
            const existedBarcodeList = await ItemService.checkExistedItemByBarcodeList(checkedBarcodeList)
            invalidBarcodeList = existedBarcodeList.filter(exBarcode => {
                const id = exBarcode.combinedId
                const variation = stVariationTable.find(r => r.itemId + '-' + r.id === id)
                if (variation && variation.barcode === exBarcode.barcode) {
                    return false // -> valid => not check
                }
                return true // -> invalid
            })
            invalidBarcodeList = [...new Set(invalidBarcodeList.map(exBarcode => exBarcode.barcode))]
        }

        if (stDuplicatedBarcode.length > 0) {
            invalidBarcodeList = [...new Set([...invalidBarcodeList, ...stDuplicatedBarcode])]
        }

        if (invalidBarcodeList.length > 0) {
            setStInvalidBarcode(invalidBarcodeList)
            return false;
        }

        return true
    }

    const removeVariation = (e, id) => {
        e.preventDefault()
        const newVariation = stVariationRow.filter(v => v.id !== id)
        setStVariationRow(newVariation)
        props.onChange()
    }

    const onVariationNameChange = (e, id) => {
        const name = e.currentTarget.value
        const newRows = stVariationRow.map(v => {
            if (v.id === id) {
                return {
                    ...v,
                    name
                }
            }
            return v
        })
        setStVariationRow(newRows)
        props.onChange()
    }

    const onVariationValuesChange = (values, id) => {
        /** values
         * [
         *  {
         *      label: string,
         *      value: string
         *  }
         * ]
         **/
        const newRows = stVariationRow.map(r => {
            if (r.id === id) {
                return {
                    ...r,
                    values: values.map(v => v.value)
                }
            }
            return r
        })
        setStVariationRow(newRows)
        props.onChange()
    }

    const createTableRowKey = (row) => {
        return (row.var1 + (row.var2 ? `-${row.var2}` : '') + (row.var3 ? `-${row.var3}` : '')).replace(/%/g, '')
    }


    const variationNameValidator = (value, ctx, input, cb) => {
        const foundVariationName = stVariationRow.filter(r => r.name === value)
        if (foundVariationName.length > 1) {
            cb(i18next.t('component.product.addNew.variations.duplicatedName'))
        } else {
            cb(true)
        }
    }


    const onChangeOrgPrice = (e, index) => {
        const {value, name} = e.currentTarget
        const clonedTable = [...stVariationTable]
        clonedTable[index].orgPrice = value
        setStVariationTable(clonedTable)
        props.onChange()
    }


    const onChangeStock = (e, index) => {
        const {value, name} = e.currentTarget
        const clonedTable = [...stVariationTable]
        clonedTable[index].stock = value
        setStVariationTable(clonedTable)
        props.onChange()

    }

    const onChangeSku = (e, index) => {
        const {value, name} = e.currentTarget
        const clonedTable = [...stVariationTable]
        clonedTable[index].sku = value
        setStVariationTable(clonedTable)
        props.onChange()

    }

    const migrateToNewModel = (model) => {
        if (!model[0].label) { // this is old model
            model.map((item) => {
                item.label = DEFAULT_NAME
            })
        }
        return model
    }

    const getVariationLength = () => {
        if (!props.variationRows || props.variationRows.length === 0) return 0
        const labelLength = props.variationRows.length
        const valuesLength = props.variationRows[0].values.length
        return labelLength * valuesLength
    }

    const parseVariationRowFromModels = () => {
        let resModels = migrateToNewModel(props.models)
        let nameList = resModels[0].label.split('|')

        // create variation rows
        let variationRow = nameList.map(n => ({
            name: n,
            values: []
        }))

        for (let model of resModels) {
            let varList = model.orgName.split('|')
            varList.forEach((name, index) => {
                variationRow[index].values.push(name)
            })
        }

        variationRow = variationRow.map(r => {
            return {
                ...r,
                values: [...new Set(r.values)]
            }
        })

        return variationRow
    }

    const mapResponseToTableData = () => {
        if (props.models && props.models.length > 0) {
            // 4(this.props.models)
            let resModels = migrateToNewModel(props.models)
            let nameList = resModels[0].label.split('|')

            // create variation rows
            let variationRow = nameList.map(n => ({
                id: Date.now() + Math.random(),
                name: n,
                values: []
            }))


            // remove deposit
            let hasDeposit = !!variationRow.find(r => r.name === DEPOSIT_CODE)
            if (!hasDeposit) return

            // variationRow = variationRow.filter(r => r.name === DEPOSIT_CODE)

            // create ref and state

            resModels = resModels.filter(m => !m.name.includes(ONE_H_PERCENT))

            let data = [], values = []
            if (nameList.length === 1) { //only one var


                for (let model of resModels) {
                    data.push({
                        tId: model.name,
                        id: model.id,
                        var1: model.name,
                        orgPrice: model.orgPrice,
                        price: model.newPrice,
                        stock: model.remaining,
                        sku: model.sku,
                        label: nameList,
                        imagePosition: model.imagePosition,
                        itemId: model.itemId,
                        totalItem: model.totalItem,
                        lstInventory: model.lstInventory,
                        barcode: model.barcode || model.itemId + '-' + model.id,
                    })
                    values.push(model.name)
                }
                variationRow[0].values = values
            } else {
                for (let model of resModels) {
                    let varList = model.orgName.split('|')


                    let dataObj = {
                        id: model.id,
                        orgPrice: model.orgPrice,
                        price: model.newPrice,
                        stock: model.remaining,
                        sku: model.sku,
                        label: nameList,
                        tId: varList.join('-'),
                        imagePosition: model.imagePosition,
                        itemId: model.itemId,
                        totalItem: model.totalItem,
                        lstInventory: model.lstInventory,
                        barcode: model.barcode || model.itemId + '-' + model.id,
                    }
                    varList.forEach((name, index) => {
                        dataObj = {
                            ...dataObj,
                            [`var${index + 1}`]: name
                        }
                        variationRow[index].values.push(name)
                    })

                    data.push(dataObj)
                }
            }

            // remove duplicate values
            variationRow = variationRow.map(r => {
                return {
                    ...r,
                    values: [...new Set(r.values)]
                }
            })
            setStVariationRow(variationRow.filter(row => row.name === DEPOSIT_CODE))
            setStVariationTable(data)


            // init barcode array
            const barcodeList = data.map(r => r.barcode)
            props.onChangeBarcodeList(barcodeList)
        }
    }

    const onClickImage = (row, index) => {
        const currentImagePosition = row.imagePosition
        if (currentImagePosition !== null) {
            refUploadModal.current.openModal({
                imgChooseIndex: currentImagePosition,
                imgDefaultIndex: currentImagePosition
            })
        } else {
            refUploadModal.current.openModal({imgChooseIndex: null, imgDefaultIndex: null})
        }
        setStCurrentEditedRowIndex(index)
    }

    const createImageSrc = (row) => {
        if (row.imagePosition === undefined || !props.imgList[row.imagePosition]) return
        let src = props.imgList[row.imagePosition]
        if (src.url || src.urlPrefix) {
            return ImageUtils.getImageFromImageModel(src, 50);
        }
        return src
    }

    const onChooseImageCallback = (obj) => {
        const clonedTable = [...stVariationTable]
        clonedTable[stCurrentEditedRowIndex].imagePosition = obj.index
        setStVariationTable(clonedTable)
        props.onChange()

    }


    const onChooseUpdateAllImageCallback = ({obj, index}) => {
        const clonedTable = [...stVariationTable]
        clonedTable.forEach((row, idx) => {
            if (stCheckList.includes(idx)) {
                row.imagePosition = index
            }
        })
        setStVariationTable(clonedTable)
        props.onChange()

    }

    const onClickUpdateAllImage = () => {
        refUpdateAllImageModal.current.openModal({imgChooseIndex: null, imgDefaultIndex: null})
    }


    const onClickUpdateStock = () => {
        setStShowUpdateStockModal(true)

    }


    const onCheckAll = (e) => {
        setStIsSingularSelect(false)
        const {checked} = e.currentTarget
        if (checked) {
            setStCheckList(stVariationTable.map((r, index) => index))
        } else {
            setStCheckList([])
        }
    }

    const onCheckedRow = (row, index) => {
        let checkedList = new Set(stCheckList)
        if (stIsSingularSelect) { // clear all check list
            setStIsSingularSelect(false)
            checkedList = new Set()
        }
        if (checkedList.has(index)) { // -> uncheck
            checkedList.delete(index)
        } else { // -> check
            checkedList.add(index)
        }
        setStCheckList([...checkedList])
    }

    const onEditDetail = (row) => {
        props.onEditDetail(row.tId.replace(/-/g, '|'))
    }

    const onClickCancelUpdateStock = () => {
        setStShowUpdateStockModal(false)
    }

    const onClickCancelUpdateSku = () => {
        setStShowUpdateSkuModal(false)
    }
    const onClickCancelUpdatePrice = () => {
        setStShowUpdatePriceModal(false)
    }

    const getSelectedList = () => {
        const selectedList = [...stVariationTable.map((v, index) => ({
            ...v,
            index
        })).filter((v, index) => stCheckList.includes(index))]
        const resolveLabel = (labelRaw) => {
            let resultArr = []
            if (Array.isArray(labelRaw)) {
                resultArr = labelRaw
            } else {
                resultArr = labelRaw.split('|')
            }
            return resultArr
        }

        const resolveInventory = (lstInventory) => {
            if (lstInventory && lstInventory.length > 0) {
                lstInventory.forEach(ivt => {
                    ivt.newStock = ivt.stock
                })
            } else {
                lstInventory = props.branchList.map(branch => ({
                    branchId: branch.id,
                    stock: 0,
                    newStock: 0,
                    updateStock: InventoryEnum.ACTIONS.SET_STOCK,
                    orgStock: 0,
                }))
            }
            return lstInventory
        }

        if (selectedList.length > 0) {
            return selectedList.map(item => {
                return {
                    id: item.id,
                    name: item.tId.split('-'),
                    index: item.index,
                    label: resolveLabel(item.label),
                    lstInventory: resolveInventory([...item.lstInventory])
                }
            })
        }
        return []
    }

    const onClickUpdateSingularRow = (index, updateType) => {
        setStIsSingularSelect(true)
        setStCheckList([index])
        setTimeout(() => {
            switch (updateType) {
                case UPDATE_TYPE_ENUM.STOCK:
                    setStShowUpdateStockModal(true)
                    break
                case UPDATE_TYPE_ENUM.SKU:
                    setStShowUpdateSkuModal(true)
                    break
                case UPDATE_TYPE_ENUM.PRICE:
                    setStShowUpdatePriceModal(true)
                    break
            }
        }, 100)
    }

    const onSaveStock = (values, mode, dataRow) => {
        /**
         * @type {VariationTableRowModel[]}
         * */
        const clonedTable = [...stVariationTable]
        dataRow.forEach(updateStockRow => {
            const index = updateStockRow.index
            const ivt = [...updateStockRow.lstInventory]
            ivt.forEach(b => {
                b.stock = b.newStock
            })
            clonedTable[index].lstInventory = ivt
            clonedTable[index].stock = updateStockRow.lstInventory.map(branch => branch.newStock).reduce((next, sum) => next + sum)
        })

        setStVariationTable(clonedTable)
        setStShowUpdateStockModal(false)
        props.onChange()

    }

    const onSaveSku = (dataRow) => {
        /**
         * @type {VariationTableRowModel[]}
         * */
        const clonedTable = [...stVariationTable]
        dataRow.forEach(updateStockRow => {
            const index = updateStockRow.index
            const ivt = [...updateStockRow.lstInventory]
            clonedTable[index].lstInventory = ivt
        })

        setStVariationTable(clonedTable)
        setStShowUpdateSkuModal(false)
        props.onChange()

    }


    const isAllowUpdateMultiStock = () => {
        return true
    }


    const onBlurBarcode = (e, index) => {
        const {value, name} = e.currentTarget
        const clonedTable = [...stVariationTable]
        if (value == undefined) return
        if (value !== '') { // check duplicate
            let invalidBarcode = [...stInvalidBarcode]
            let duplicateBarcode = [...stDuplicatedBarcode]
            const oldBarcode = clonedTable[index].barcode
            invalidBarcode = invalidBarcode.filter(barcode => barcode !== oldBarcode)
            duplicateBarcode = duplicateBarcode.filter(barcode => barcode !== oldBarcode)
            // find duplicate barcode -> error, barcode list merge from variation and deposit
            if (clonedTable.find((r, idx) => r.barcode === value && idx !== index)
                || (props.depositBarcodeList && props.depositBarcodeList.includes(value))
            ) {
                invalidBarcode = duplicateBarcode = [...new Set([...invalidBarcode, value])]
            }
            setStInvalidBarcode(invalidBarcode)
            setStDuplicatedBarcode(duplicateBarcode)
        }
        clonedTable[index].barcode = value
        // export barcode list
        const barcodeList = clonedTable.map(r => r.barcode)
        props.onChangeBarcodeList(barcodeList)
        setStVariationTable(clonedTable)
        props.onChange()
    }

    return (
        <div className="product-form-variation-selector">
            <ProductVariationPriceEditorModal isOpen={stShowUpdatePriceModal}
                                              variationTable={stVariationTable}
                                              onCancel={onClickCancelUpdatePrice}
                                              checkedList={stCheckList}
                                              onSave={onSavePrice}
                                              modalMode={Constants.PRODUCT_VARIATION_EDITOR_MODE.DEPOSIT}
                                              key={stShowUpdatePriceModal}
                                              symbolCode={props.symbolCode}
            />
            <ProductMultipleBranchSKUEditorModal isOpen={stShowUpdateSkuModal}
                                                 dataTable={getSelectedList()}
                                                 item={props.item}
                                                 variationLength={stCheckList.length}
                                                 selected={props.branchList.map(b => b.id)}
                                                 branchList={props.branchList}
                                                 onCancel={onClickCancelUpdateSku}
                                                 onSave={onSaveSku}
                                                 prodName={props.prodName}
            />
            <ProductMultipleBranchStockEditorModal isOpen={stShowUpdateStockModal}
                                                   key={stShowUpdateStockModal}
                                                   onCancel={onClickCancelUpdateStock}
                                                   branchList={props.branchList}
                                                   item={props.item}
                                                   dataTable={getSelectedList()}
                                                   variationLength={stCheckList.length}
                                                   selected={props.branchList.map(b => b.id)}
                                                   prodName={props.prodName}
                                                   onSave={onSaveStock}
            />
            <GSModalUploadImage ref={refUploadModal}
                                imgList={props.imgList}
                                onImageUploaded={props.onImageUploaded}
                                callbackMode={"outerChange"}
                                chooseImageAction={onChooseImageCallback}
                                okBtnText={i18next.t("common.text.select")}
            />
            <GSModalUploadImage ref={refUpdateAllImageModal}
                                imgList={props.imgList}
                                onImageUploaded={props.onImageUploaded}
                                callbackMode={"outerChange"}
                                chooseImageAction={onChooseUpdateAllImageCallback}
                                okBtnText={i18next.t("common.text.select")}
            />

            {/*==== VARIATION HEADER =====*/}
            {stVariationRow.length > 0 &&
            <div className=" d-none d-md-block row">
                <div className="col-md-12 w-100 p-0">
                    <label className="gs-frm-input__label">
                        <GSTrans t={'page.product.create.variation.deposit.value'}/>
                    </label>
                </div>
            </div>
            }
            {/*==== VARIATION BODY =====*/}
            {stVariationRow.map((row, index) => (
                    <div className="row" key={index}>
                        <div className="col-12 col-md-3 p-0 d-none">
                            <AvFieldCountable
                                name={"variationName-" + row.id}
                                validate={{
                                    ...FormValidate.required(),
                                    ...FormValidate.maxLength(14),
                                    ...FormValidate.async(variationNameValidator, 0)
                                }}
                                maxLength={14}
                                minLength={1}
                                onChange={(e) => onVariationNameChange(e, row.id)}
                                value={row.name}
                                className={(props.disabledVariation ? 'disabled cursor-unset' : '')}
                            />
                        </div>
                        <div className="d-block d-md-none col-md-8 w-100 variation-item-label-second">
                            <label className="gs-frm-input__label">
                                <GSTrans t={'page.product.create.variation.deposit.value'}/>
                            </label>
                        </div>
                        <div className="col-md-11 w-100 mb-3 pl-0 d-flex d-md-block">
                            <div className="flex-grow-1">
                                <GSTags maxItemTextLength={50}
                                        maxLength={20}
                                        className={(props.disabledVariation ? 'product-form-variation-selector__gs-tag disabled cursor-unset' : 'product-form-variation-selector__gs-tag')}
                                        isRequired
                                        placeholder={i18next.t('page.product.create.variation.deposit.placeholder')}
                                        onChange={value => onVariationValuesChange(value, row.id)}
                                        defaultValue={row.values}
                                        ignoreMatchRegex={/[|]/g}
                                        confirmKeys={['Enter']}
                                        ref={refTags}
                                />
                            </div>

                            <GSButton
                                className={"d-inline d-md-none product-form-variation-selector__btn-delete ml-2 " + (props.disabledVariation ? "disabled" : "cursor--pointer")}
                                onClick={(e) => removeVariation(e, row.id)}
                            >
                                <img src="/assets/images/icon-delete.png"/>
                            </GSButton>
                        </div>
                        <div className="d-none d-md-block col-1 p-0">
                            <GSButton
                                className={"product-form-variation-selector__btn-delete " + (props.disabledVariation ? "disabled" : "cursor--pointer ")}
                                onClick={(e) => removeVariation(e, row.id)}
                            >
                                <img src="/assets/images/icon-delete.png"/>
                            </GSButton>
                        </div>
                        {
                            props.disabledVariation
                        }
                    </div>
                )
            )}

            {/*======= VARIATION TABLE ======*/}
            {stVariationTable.length > MAX_ROW &&
            <AlertInline nonIcon type={AlertInlineType.ERROR}
                         text={i18next.t('component.product.addNew.variations.max400d', {max: MAX_ROW})}/>
            }

            {stVariationTable.length > 0 &&
            <GSTable
                className={`product-form-variation-selector__table table table-responsive product-form-variation-selector__table--${stVariationTable.length > 50 ? 'error' : 'normal'}`}>
                <thead>
                {stCheckList.length > 0 && !stIsSingularSelect &&
                <tr>
                    <th className="align-middle" colSpan={8 + stVariationRow.length}>
                        <div className="d-flex align-items-center h-100">
                            <GSTrans t={"page.product.create.variation.selected"}
                                     values={{
                                         x: stCheckList.length
                                     }}
                            />
                            <GSDropDownButton button={
                                ({onClick}) => (
                                    <GSFakeLink className="ml-3" onClick={e => {
                                        e.preventDefault()
                                        onClick()
                                    }}>
                                        <GSTrans t="page.product.create.variation.selectAction"/>
                                    </GSFakeLink>
                                )
                            }>
                                <GSDropdownItem
                                    className={props.disabledPrice ? "disabled" : "cursor--pointer"}
                                    onClick={() => setStShowUpdatePriceModal(true)}>
                                    <GSTrans t={"page.product.updatePriceModal.title"}/>
                                </GSDropdownItem>
                                <GSDropdownItem onClick={onClickUpdateStock}
                                                className={props.disabledStock ? "disabled" : "cursor--pointer"}
                                >
                                    <GSTrans t={"page.product.create.updateStockModal.title"}/>
                                </GSDropdownItem>
                                <GSDropdownItem onClick={() => setStShowUpdateSkuModal(true)}>
                                    <GSTrans t={"page.product.updateSkuModal.title"}/>
                                </GSDropdownItem>
                                <GSDropdownItem onClick={onClickUpdateAllImage}>
                                    <GSTrans t={"page.product.create.variation.updateImage"}/>
                                </GSDropdownItem>
                            </GSDropDownButton>
                        </div>
                    </th>
                </tr>
                }
                <tr>
                    <th className="align-middle">
                        <UikCheckbox
                            checked={stCheckList.length === stVariationTable.length && !stIsSingularSelect}
                            style={{
                                marginLeft: '.5rem'
                            }}
                            onClick={onCheckAll}
                        />
                    </th>
                    <th className="align-middle">
                        <GSTrans t={"page.landingPage.editor.elementEditor.image"}/>
                    </th>

                    {props.variationRows.map(row => (
                        <th className="align-middle" key={row.id}>
                            {row.name}
                        </th>
                    ))}

                    <th className="align-middle">
                        <GSTrans t={"page.product.create.variation.deposit"}/>
                    </th>

                    <th className="align-middle text-center input-th">
                        <GSTrans t={"component.product.addNew.pricingAndInventory.price"}/>
                    </th>
                    <th className="align-middle text-center input-th-stock">
                        <GSTrans t={"component.product.addNew.pricingAndInventory.stock"}/>
                    </th>
                    <th className="align-middle text-center input-th">
                        SKU
                    </th>
                    <th className="text-center align-middle">
                        <GSTrans t={"page.product.list.printBarCode.barcode"}/>
                    </th>
                    <th>
                    </th>
                </tr>
                </thead>
                <tbody>
                {stVariationTable.map((row, index) => (
                    <tr key={row.var1 + (row.var2 ? '|' + row.var2 : '') + (row.var3 ? '|' + row.var3 : '')}>
                        <td className="align-middle">
                            <UikCheckbox
                                checked={stCheckList.includes(index) && !stIsSingularSelect}
                                style={{
                                    marginLeft: '.5rem'
                                }}
                                onClick={() => onCheckedRow(row, index)}
                            />
                        </td>
                        <td className="align-middle">
                            <GSImg height={50}
                                   width={50}
                                   onClick={() => onClickImage(row, index)}
                                   src={createImageSrc(row)}
                                   className="cursor--pointer"
                            />
                        </td>
                        <td className="align-middle">{row.var1}</td>
                        {row.var2 ? <td className="align-middle">{row.var2}</td> : null}
                        {row.var3 ? <td className="align-middle">{row.var3}</td> : null}
                        <td className="align-middle">
                            <div className={props.disabledPrice ? "disabled" : "cursor--pointer"}
                                 onClick={() => onClickUpdateSingularRow(index, UPDATE_TYPE_ENUM.PRICE)}>
                                <div className=" user-event-disabled">
                                    <AvFieldCurrency className="input-min-width"
                                                     name={createTableRowKey(row) + '-orgPrice'}
                                                     value={row.orgPrice}
                                                     unit={props.symbolCode}
                                                     validate={{
                                                         ...FormValidate.minValue(0, true),
                                                         ...FormValidate.maxValue(Constants.VALIDATIONS.PRODUCT.MAX_PRICE, true),
                                                         ...FormValidate.required()
                                                     }}
                                                     onBlur={(e) => onChangeOrgPrice(e, index)}
                                                     position={CurrencyUtils.isPosition(props.symbolCode)}
                                                     precision={CurrencyUtils.isCurrencyInput(props.symbolCode) && '2'}
                                                     decimalScale={CurrencyUtils.isCurrencyInput(props.symbolCode) && 2}

                                    />
                                </div>
                            </div>
                        </td>
                        <td className="align-middle text-center">
                            {props.mode === ProductFormEditorMode.ADD_NEW &&
                            <div className="cursor--pointer"
                                 onClick={() => onClickUpdateSingularRow(index, UPDATE_TYPE_ENUM.STOCK)}>
                                <div className=" user-event-disabled">
                                    <AvFieldCurrency className="input-min-width "
                                                     name={index + '-stock'}
                                                     value={row.stock}
                                                     unit={CurrencySymbol.NONE}
                                                     onBlur={(e) => onChangeStock(e, index)}
                                    />
                                </div>
                            </div>
                            }
                            {props.mode === ProductFormEditorMode.EDIT &&
                            <GSFakeLink
                                className={props.disabledStock ? "disabled" : "cursor--pointer"}
                                onClick={() => onClickUpdateSingularRow(index, UPDATE_TYPE_ENUM.STOCK)}>
                                {NumberUtils.formatThousand(row.stock)}
                            </GSFakeLink>
                            }
                        </td>
                        <td className="align-middle text-center">
                            {props.mode === ProductFormEditorMode.ADD_NEW &&
                            <div className="cursor--pointer"
                                 onClick={() => onClickUpdateSingularRow(index, UPDATE_TYPE_ENUM.SKU)}>
                                <div className=" user-event-disabled">
                                    <AvField className="input-min-width"
                                             name={index + '-sku'}
                                             unit={CurrencySymbol.NONE}
                                    />
                                </div>
                            </div>
                            }
                            {props.mode === ProductFormEditorMode.EDIT &&
                            <GSFakeLink onClick={() => onClickUpdateSingularRow(index, UPDATE_TYPE_ENUM.SKU)}>
                                <GSTrans t={"page.product.editSku"}/>
                            </GSFakeLink>
                            }
                        </td>
                        <td className="align-middle">
                            <AvField className="input-min-width"
                                     name={index + '-barcode-dep'}
                                     value={row.barcode}
                                     unit={CurrencySymbol.NONE}
                                     validate={{
                                         ...FormValidate.maxLength(48),
                                         ...FormValidate.async((value, ctx, input, cb) => {
                                             if (!stInvalidBarcode.includes(row.barcode)) {
                                                 cb(true)
                                             } else {
                                                 if (stDuplicatedBarcode.includes(row.barcode)) {
                                                     cb(i18next.t`page.product.create.duplicateBarcode`)
                                                 } else {
                                                     cb(i18next.t`page.product.create.existedBarcode`)
                                                 }
                                             }
                                         })
                                     }}
                                     onBlur={(e) => onBlurBarcode(e, index)}
                                     style={{fontFamily: 'monospace'}}
                            />
                        </td>
                        <td className="align-middle">
                            <GSActionButton icon={GSActionButtonIcons.EDIT}
                                            onClick={() => onEditDetail(row)}
                            />
                        </td>
                    </tr>
                ))}
                </tbody>
            </GSTable>}
        </div>
    );
};

ProductFormDepositSelector.defaultProps = {
    price: 0,
    discountPrice: 0,
    sku: ''
}

ProductFormDepositSelector.propTypes = {
    onLengthChange: PropTypes.func,
    mode: PropTypes.string,
    variationRows: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.number,
            name: PropTypes.string,
            values: PropTypes.arrayOf(PropTypes.string)
        })
    ),
    imgList: PropTypes.array,
    onImageUploaded: PropTypes.func,
    onClickImage: PropTypes.func,
    onEditDetail: PropTypes.func,
    item: PropTypes.any,
    prodName: PropTypes.string,
    branchList: PropTypes.arrayOf(PropTypes.shape({
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
    onChangeBarcodeList: PropTypes.func,
    variationBarcodeList: PropTypes.array,
    onChange: PropTypes.func,
    disabledPrice: PropTypes.bool,
    disabledStock: PropTypes.bool,
    disabledVariation: PropTypes.bool,
    symbolCode: PropTypes.string
};

export default React.forwardRef(ProductFormDepositSelector);
