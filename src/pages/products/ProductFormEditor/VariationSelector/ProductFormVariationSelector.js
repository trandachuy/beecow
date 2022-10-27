/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 29/04/2020
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React, {useEffect, useImperativeHandle, useRef, useState} from "react";
import "./ProductFormVariationSelector.sass";
import GSButton from "../../../../components/shared/GSButton/GSButton";
import GSTags from "../../../../components/shared/form/GSTags/GSTags";
import AvFieldCountable from "../../../../components/shared/form/CountableAvField/AvFieldCountable";
import {FormValidate} from "../../../../config/form-validate";
import GSTrans from "../../../../components/shared/GSTrans/GSTrans";
import PropTypes from "prop-types";
import i18next from "i18next";
import GSTable from "../../../../components/shared/GSTable/GSTable";
import {UikCheckbox} from "../../../../@uik";
import AvFieldCurrency from "../../../../components/shared/AvFieldCurrency/AvFieldCurrency";
import {CurrencySymbol} from "../../../../components/shared/form/CryStrapInput/CryStrapInput";
import {AvField} from "availity-reactstrap-validation";
import GSActionButton, {GSActionButtonIcons,} from "../../../../components/shared/GSActionButton/GSActionButton";
import {ProductFormEditorMode} from "../ProductFormEditor";
import {CurrencyUtils, NumberUtils} from "../../../../utils/number-format";
import {PricingUtils} from "../../../../utils/pricing";
import AlertInline, {AlertInlineType,} from "../../../../components/shared/AlertInline/AlertInline";
import GSImg from "../../../../components/shared/GSImg/GSImg";
import GSModalUploadImage from "../../../../components/shared/GSModal/GSModalUploadImage/GSModalUploadImage";
import GSFakeLink from "../../../../components/shared/GSFakeLink/GSFakeLink";
import GSDropDownButton, {GSDropdownItem,} from "../../../../components/shared/GSButton/DropDown/GSDropdownButton";
import Constants from "../../../../config/Constant";
import ProductMultipleBranchStockEditorModal
    from "../MultipleBranchStockEditorModal/ProductMultipleBranchStockEditorModal";
import {InventoryEnum} from "../../InventoryList/InventoryEnum";
import ProductMultipleBranchSKUEditorModal from "../MultipleBranchSKUEditorModal/ProductMultipleBranchSKUEditorModal";
import ProductVariationPriceEditorModal from "../VaritionPriceEditorModal/ProductVariationPriceEditorModal";
import {ItemService} from "../../../../services/ItemService";
import {ItemUtils} from "../../../../utils/item-utils";
import {ImageUtils} from "../../../../utils/image";
import ManagedInventoryModal from "../managedInventoryModal/ManagedInventoryModal";
import {Modal, ModalBody, ModalFooter, ModalHeader} from "reactstrap";
import ConfirmModal from "../../../../components/shared/ConfirmModal/ConfirmModal";

const DEFAULT_NAME = "GoMua";
const MAX_ROW = 50
const DEPOSIT_CODE = '[d3p0s1t]'
const ONE_H_PERCENT = '[100P3rc3nt]'
const UPDATE_TYPE_ENUM = {
    STOCK: 'STOCK',
    SKU: 'SKU',
    PRICE: 'PRICE',
}
const VariationEditorMode = {
    ADD_NEW_ROW: 'addNewRow',
    REMOVE_ROW: 'removeRow',
    ADD_NEW_ITEM: 'addNewItem',
    REMOVE_ITEM: 'removeItem',
    CHANGE_ITEM: 'changeItem'
}
const validateVariation = {
    HAS_DATA: 'HAS_DATA',
    NONE: 'NONE',
    DATA_NULL: 'DATA_NULL',
}

const ProductFormVariationSelector = (props, ref) => {
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
    const [stIsOpenManagedInventoryModal, setStIsOpenManagedInventoryModal] = useState(false);
    const [stIndexVariationRow, setStIndexVariationRow] = useState(null);
    const [stItemModels, setStItemModels] = useState([]);
    const [stModalNotificationIMEI, setStModalNotificationIMEI] = useState(false);
    const [stRemoveVariation, setStRemoveVariation] = useState(false);
    const [allVarsWholesale, setAllVarsWholesale] = useState([])
    const [stCheckNewPriceErrors, setStCheckNewPriceErrors] = useState([])
    const [checkInvalidVariation, setCheckInvalidVariation] = useState(false);
    let refConfirmModal = useRef();

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
            if (props.depositBarcodeList.includes(r.barcode)) {
                currentInvalidBarcode.add(r.barcode)
                currentDuplicatedBarcode.add(r.barcode)
            }
        })
        setStInvalidBarcode([...currentInvalidBarcode])
        setStDuplicatedBarcode([...currentDuplicatedBarcode])
    }, [props.depositBarcodeList])
    useEffect(() => {
    }, [stInvalidBarcode])
    useImperativeHandle(
        ref,
        () => ({
            addVariation,
            isValid,
            getValue,
            onRemoveImage
        }),
    );
    useEffect(() => {
        if (props.models && props.models.length > 0) {
            setStByPassRender(true)
        }

    }, [])
    useEffect(() => {
        if(props.groupItemModelWholesale){
            let list = listSelectedVariations(props.groupItemModelWholesale)
            setAllVarsWholesale(list)
        }
    }, [])

    useEffect(() => {
        if(props.mode === ProductFormEditorMode.EDIT){
            if(stVariationTable.length === 0){
                let itemModels = _.cloneDeep(stVariationTable)
                setStItemModels(_.cloneDeep(itemModels))
                return
            }
            setStItemModels(stVariationTable)
        }
        validateVariationForWholesale()
    }, [stVariationTable])

    useEffect(() => {
        if (stByPassRender) {
            mapResponseToTableData()
        }
    }, [stByPassRender])

    useEffect(() => {
        if (props.onLengthChange) {
            props.onLengthChange(stVariationRow.length)
        }
        validateVariationForWholesale()

    }, [stVariationRow.length]);

    useEffect(() => {
        if(props.settingWholesale){
            validateVariationForWholesale()
        }else{
            setCheckInvalidVariation(false)
            setStCheckNewPriceErrors([])
        }
        
    }, [props.settingWholesale])

    const validateVariationForWholesale = () => {
        if(props.settingWholesale){
            let checkValidate = ''
            if(stVariationRow.length > 0){
                
                if(stVariationTable.length > 0 ){
                    let listErrors = []
                    for(const {price} of stVariationTable){
                        let err = ''
                        if(price === 0){
                            err = 'is-invalid'
                        }
                        listErrors.push(err)
                    }
                    setStCheckNewPriceErrors(listErrors)
                    setCheckInvalidVariation(false)
                    checkValidate = validateVariation.HAS_DATA
                }else{
                    setCheckInvalidVariation(true)
                    checkValidate = validateVariation.DATA_NULL
                }
                
            }else{
                checkValidate = validateVariation.NONE
            }
            props.checkVariationForWholesale(checkValidate)
        }else{
            setCheckInvalidVariation(false)
            setStCheckNewPriceErrors([])
        }
    }

    useEffect(() => {
        if (stByPassRender) {
            setStByPassRender(false)
            return;
        };
        if (props.onVariationRowsChange) {
            props.onVariationRowsChange(stVariationRow)
        }
        if (stVariationRow.length === 0) {
            // clear table
            setStVariationTable([])
            return
        }
        if (props.onVariationTableChange) {
            props.onVariationTableChange(stVariationTable)
        }
        let dataBackup = stVariationTable
        let data = []
        let costPrice = props.costPrice
        let orgPrice = props.price
        let price = props.discountPrice
        let stock = props.stock
        let sku = props.sku
        let foundItem
        let sumOfStock = 0
        // create table
        // if have one var
        if (stVariationRow.length ===  1) {
            for (let [index, var1] of stVariationRow[0].values.entries()) {
                // if already existed -> add to array and update stock
                foundItem = dataBackup.filter( (item) => item.var1 === var1 && !item.var2)
                if (foundItem.length > 0) {
                    data.push(foundItem[0])
                    sumOfStock += foundItem[0].stock
                } else {
                    // add new
                    data.push( {
                        tId: var1,
                        var1: var1,
                        costPrice: costPrice,
                        orgPrice: orgPrice,
                        price:  price,
                        stock: stock,
                        sku: sku,
                        label: stVariationRow.map(r => r.name).join('|'),
                        lstInventory: ItemUtils.mapBranchesToLstInventory(props.branchList)
                    })
                    sumOfStock += stock
                }
            }
            let dataIds = data.map(r => {return r.id})
            let excludedVars = stVariationTable.filter(r => !dataIds.includes(r.id))
            if(props.variationRemoved) props.variationRemoved(excludedVars)
            // if(props.variationList) props.variationList(data)
            setStVariationTable(data)
        }
        //if have two vars
        let rows = 0
        if (stVariationRow.length === 2) {
            for (let var1 of stVariationRow[0].values) {
                for (let var2 of stVariationRow[1].values) {
                    foundItem = dataBackup.filter( (item) => item.var1 === var1 && item.var2 && item.var2 === var2 && !item.var3)
                    if (foundItem.length > 0) {
                        data.push(foundItem[0])
                        sumOfStock += foundItem[0].stock
                    } else {
                        // invalidBackup = invalidBackup.filter( inputName => inputName.chartAt(0) != (rows+1))
                        data.push( {
                            tId: var1 + '-' + var2,
                            var1: var1,
                            var2: var2,
                            costPrice: costPrice,
                            orgPrice: orgPrice,
                            price: price,
                            stock: stock,
                            sku: sku,
                            label: stVariationRow.map(r => r.name).join('|'),
                            lstInventory: ItemUtils.mapBranchesToLstInventory(props.branchList)


                        })
                        sumOfStock += stock
                    }
                    rows++
                }
            }
            let dataIds = data.map(r => {return r.id})
            let excludedVars = stVariationTable.filter(r => !dataIds.includes(r.id))
            if(props.variationRemoved) props.variationRemoved(excludedVars)
            // if(props.variationList) props.variationList(data)
            setStVariationTable(data)
        }
        setStCheckList([])
    }, [stVariationRow]);

    useEffect(()=>{
        handleCancelManagedInventory()
        setStRemoveVariation(state=>!state)
    },[props.statusManageInventory])

    const handleCancelManagedInventory = () =>{
        if (stVariationRow.length >=  1){
            const clonedTable = [...stVariationTable]
            clonedTable.forEach((data,index)=>{
                data.lstInventory = ItemUtils.mapBranchesToLstInventory(props.branchList)
                data.stock = 0
                delete clonedTable[index].itemModelCodeDTOS
            })
            setStVariationTable(clonedTable)
        }

    }


    const getValue = () => {
        // if has deposit -> add 100% deposit
        const hasDeposit = props.depositLength > 0
        let label
        if (hasDeposit) {
            label = [...stVariationRow.map(r => r.name), DEPOSIT_CODE].join('|')
        } else {
            label = stVariationRow.map(r => r.name).join('|')
        }
        return stVariationTable.map( (item, index) => {
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
                name: item.var1 + (item.var2? '|'+item.var2:'')+ (hasDeposit? `|${ONE_H_PERCENT}`:''),
                orgPrice: item.orgPrice,
                discount: PricingUtils.calculateDiscount(item.orgPrice, item.price),
                newPrice: item.price,
                // if ADD_NEW -> get new stock, if EDIT but this is new variation -> get new stock
                totalItem: props.mode === ProductFormEditorMode.ADD_NEW? item.stock: (item.totalItem? item.totalItem:0),
                label: label,
                sku: item.sku,
                imagePosition: item.imagePosition,
                newStock: item.stock,
                ...orgModel,
                barcode: item.barcode || (item.id? combinedId:undefined),
                costPrice: +(item.costPrice),
            }
            result.lstInventory = ItemUtils.mapInventoryToRequest(item.lstInventory, props.fullBranchList)
            if (props.statusManageInventory != "PRODUCT"){
                result.itemModelCodeDTOS = item.itemModelCodeDTOS
            }
            //
            // if (id) { // if old variation -> check change inventory
            //     if (orgModel.remaining !== item.stock) {
            //         result.inventoryType = item.inventoryType.toUpperCase()
            //         switch (result.inventoryType) {
            //             case 'CHANGE':
            //                 result.inventoryStock = item.stock - orgModel.remaining
            //                 break
            //             case 'SET':
            //                 result.inventoryStock = item.stock
            //                 result.inventoryCurrent = orgModel.remaining
            //                 break
            //         }
            //
            //         result.inventoryActionType = 'FROM_UPDATE_AT_ITEM_SCREEN'
            //     }
            // } else { // set inventory SET for new variation
            //     result.inventoryType = 'SET'
            //     result.inventoryCurrent = 0
            //     result.inventoryStock = item.stock
            //     result.inventoryActionType = 'FROM_CREATE_AT_ITEM_SCREEN'
            // }
            return result
        })
    }
    const addVariation = () => {
        props.onChangeImeiModal()
        const newIndex = Date.now()
        const newVar = {
            id: newIndex,
            name: '',
            values: []
        }
        setStVariationRow(stVariationRow => ([...stVariationRow, newVar]))
        setStRemoveVariation(state=>!state)
        props.onChange(VariationEditorMode.ADD_NEW_ROW)
    }
    
    const onRemoveImage = (index) => {
        const clonedTable = [...stVariationTable]
        clonedTable.forEach(row => {
            if (row.imagePosition === undefined) return
            if (row.imagePosition === index) {
                row.imagePosition = -1
            }
            if (row.imagePosition > index) {
                row.imagePosition -= 1
            }
        })
        setStVariationTable(clonedTable)
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
        // // check max row
        if (stVariationTable.length > MAX_ROW) {
            return false
        }
        //
        if (stVariationTable.filter(r => r.newStock > 1_000_000).length > 0) {
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
            invalidBarcodeList = [... new Set(invalidBarcodeList.map(exBarcode => exBarcode.barcode))]
        }
        if (stDuplicatedBarcode.length > 0) {
            invalidBarcodeList = [...new Set([...invalidBarcodeList, ...stDuplicatedBarcode])]
        }
        if (invalidBarcodeList.length > 0) {
            setStInvalidBarcode(invalidBarcodeList)
            return  false;
        }
        return true
    }
    const removeVariation = (e, id) => {
        e.preventDefault()
        const newVariation = stVariationRow.filter(v => v.id !== id)
        setStVariationRow(newVariation)
        setStRemoveVariation(state=>!state)
        props.onChange(VariationEditorMode.REMOVE_ROW)
        props.onChangeImeiModal()
    }
    
    const onVariationNameChange = (e, id) => {
        const name = e.currentTarget.value.replace(/[|]/g, '')
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
        props.onChange(VariationEditorMode.CHANGE_ITEM)
        if(!props.settingWholesale) return
        if(newRows.find(r=> r.values.length === 0)){
            props.checkVariationForWholesale(validateVariation.DATA_NULL)
        }
    }
    const createTableRowKey = (row) => {
        return row.var1 + (row.var2? `-${row.var2}`:'') + (row.var3? `-${row.var3}`:'')
    }
    const maxDiscountPriceValidator = (value, ctx, input, cb) => {
        const {name} = input.props
        const [index] = name.split('-')
        const foundRow = stVariationTable[index]
        if (parseInt(input.value) > foundRow.orgPrice) {
            cb(i18next.t("common.validation.number.max.value", {x:CurrencyUtils.formatThousand(foundRow.orgPrice)}))
        } else {
            cb(true)
        }
    }
    const maxCostPriceValidator = (value, ctx, input, cb) => {
        const {name} = input.props
        const [index] = name.split('-')
        const foundRow = stVariationTable[index]
        if (parseInt(input.value) > foundRow.price) {
            cb(i18next.t("common.validation.costPrice.value"))
        } else {
            cb(true)
        }
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
    const onChangeCostPrice  = (e, index) => {
        const {value, name} = e.currentTarget
        const clonedTable = [...stVariationTable]
        clonedTable[index].costPrice = value
        setStVariationTable(clonedTable)
        props.onChange()
    }
    const onChangeDiscountPrice = (e, index) => {
        const {value, name} = e.currentTarget
        const clonedTable = [...stVariationTable]
        //BH-5173 if new price = 0, set to default value is org price
        if (!value || value === 0) {
            clonedTable[index].price = clonedTable[index].orgPrice;
        }
        else {
            clonedTable[index].price = value
        }
        setStVariationTable(clonedTable)
        props.onChange()
    }
    const onChangeStock = (e, index) => {
        const {value, name} = e.currentTarget
        const clonedTable = [...stVariationTable]
        clonedTable[index].stock = value || 0
        setStVariationTable(clonedTable)
    }
    const onChangeSku = (e, index) => {
        const {value, name} = e.currentTarget
        const clonedTable = [...stVariationTable]
        clonedTable[index].sku = value
        setStVariationTable(clonedTable)
    }
    const onBlurBarcode = (e, index) => {
        const {value, name} = e.currentTarget
        const clonedTable = [...stVariationTable]
        if (value == undefined) return
        if (value !== '') { // c
            let invalidBarcode = [...stInvalidBarcode]
            let duplicateBarcode = [...stDuplicatedBarcode]
            const oldBarcode = clonedTable[index].barcode
            invalidBarcode = invalidBarcode.filter(barcode => barcode !== oldBarcode)
            duplicateBarcode = duplicateBarcode.filter(barcode => barcode !== oldBarcode)
            // find duplicate barcode -> error, barcode list merge from variation and deposit
            if (clonedTable.find((r, idx) => r.barcode === value && idx !== index)
                || props.depositBarcodeList.includes(value)
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
    const migrateToNewModel = (model) => {
        if (!model[0].label) { // this is old model
            model.map( (item) => {
                item.label = DEFAULT_NAME
            })
        }
        return model
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
            variationRow = variationRow.filter(r => r.name !== DEPOSIT_CODE)
            if (variationRow.length === 0) return
            // create ref and state
            if (hasDeposit) { // remove all deposit but 100percent
                resModels = resModels.filter(m => m.name.includes(ONE_H_PERCENT))
            }
            let data = [], values = []
            if (nameList.length === 1) { //only one var
                for (let model of resModels) {
                    data.push( {
                        tId: model.name,
                        id: model.id,
                        var1: model.name,
                        costPrice: model.costPrice,
                        orgPrice: model.orgPrice,
                        price: model.newPrice,
                        stock: model.remaining,
                        sku: model.sku,
                        label: nameList,
                        imagePosition: model.imagePosition,
                        itemId: model.itemId,
                        totalItem: model.totalItem,
                        lstInventory: model.lstInventory,
                        barcode:  model.barcode || model.itemId + '-' + model.id,
                        itemModelCodeDTOS:model.itemModelCodeDTOS
                    })
                    values.push(model.name)
                }
                variationRow[0].values = values
            } else {
                for (let model of resModels) {
                    let varList
                    if (hasDeposit) {
                        varList = model.orgName.split('|').slice(0, -1)
                    } else {
                        varList = model.orgName.split('|')
                    }
                    let dataObj = {
                        id: model.id,
                        costPrice: model.costPrice,
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
                        barcode:  model.barcode || model.itemId + '-' + model.id,
                        itemModelCodeDTOS:model.itemModelCodeDTOS
                    }
                    varList.forEach( (name, index) => {
                        dataObj = {
                            ...dataObj,
                            [`var${index+1}`]: name
                        }
                        variationRow[index].values.push(name)
                    })
                    data.push(dataObj)
                }
            }
            // remove duplicate
            variationRow = variationRow.map(r => {
                return {
                    ...r,
                    values: [...new Set(r.values)]
                }
            })
            setStVariationRow(variationRow)
            setStVariationTable(data)
            setStByPassRender(false)
            // init barcode array
            const barcodeList = data.map(r => r.barcode)
            props.onChangeBarcodeList(barcodeList)
        }
    }
    const onClickImage = (row, index) => {
        const currentImagePosition = row.imagePosition
        if (currentImagePosition !== null && currentImagePosition !== undefined) {
            refUploadModal.current.openModal({imgChooseIndex: currentImagePosition, imgDefaultIndex: currentImagePosition})
        } else {
            refUploadModal.current.openModal({imgChooseIndex: null, imgDefaultIndex: null})
        }
        setStCurrentEditedRowIndex(index)
    }
    const onClickUpdateAllImage = () => {
        refUpdateAllImageModal.current.openModal({imgChooseIndex: null, imgDefaultIndex: null})
    }
    const onChooseImageCallback = ({obj, index}) => {
        const clonedTable = [...stVariationTable]
        clonedTable[stCurrentEditedRowIndex].imagePosition = index
        setStVariationTable(clonedTable)
        props.onChange()
    }
    const onChooseUpdateAllImageCallback = ({obj, index}) => {
        const clonedTable = [...stVariationTable]
        clonedTable.forEach( (row, idx) => {
            if (stCheckList.includes(idx)) {
                row.imagePosition = index
            }
        })
        setStVariationTable(clonedTable)
        props.onChange()
    }
    const createImageSrc = (row) => {
        if (row.imagePosition === undefined || !props.imgList[row.imagePosition]) return
        let src = props.imgList[row.imagePosition]
        if (src.url || src.urlPrefix) {
            return ImageUtils.getImageFromImageModel(src, 50);
        }
        return src
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
    const onCheckAll = (e) => {
        setStIsSingularSelect(false)
        const {checked} = e.currentTarget
        if (checked) {
            setStCheckList( stVariationTable.map( (r, index) => index) )
        } else {
            setStCheckList([])
        }
    }
    const onEditDetail = (row) => {
        if (props.depositLength > 0) {
            props.onEditDetail(  row.tId.replace(/-/g, '|') + '|' + ONE_H_PERCENT)
        } else {
            props.onEditDetail(  row.tId.replace(/-/g, '|'))
        }
    }
    const onClickUpdateStock = () => {
        if(stCheckList.length > 1 && props.statusManageInventory == "IMEI_SERIAL_NUMBER"){
            setStModalNotificationIMEI(true)

        } else {
            setStShowUpdateStockModal(true)
        }
    }
    const getSelectedList = () => {
        const selectedList = [...stVariationTable.map((v, index) => ({...v, index})).filter((v, index) => stCheckList.includes(index))]
        const resolveLabel = (labelRaw) => {
            let resultArr = []
            if (Array.isArray(labelRaw)) {
                resultArr = labelRaw
            } else {
                resultArr = labelRaw.split('|')
            }
            return resultArr.filter(label => label !== DEPOSIT_CODE)
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
    const onClickCancelUpdateStock = () => {
        setStShowUpdateStockModal(false)
    }
    const onClickCancelUpdateSku = () => {
        setStShowUpdateSkuModal(false)
    }
    const onClickCancelUpdatePrice = () => {
        setStShowUpdatePriceModal(false)
    }

    const onClickCancelModalIMEI = () => {
        setStModalNotificationIMEI(false)
    }
    /**
     * @param values
     * @param mode
     * @param {UpdateStockDataRowModel[]} dataRow
     */
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
            clonedTable[index].stock = updateStockRow.lstInventory.map(branch => branch.newStock).reduce( (next, sum) => next + sum)
        })
        setStVariationTable(clonedTable)
        setStShowUpdateStockModal(false)
        props.onChange()
    }
    const onSavePrice = (variationTable) => {
        setStVariationTable(variationTable)
        setStShowUpdatePriceModal(false)
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
    const isAllowUpdateMultiStock = () => {
        return true
    }

    const getDataForUpdateStockManagedInventory = (managedInventoryList) =>{
        let lstInventory = stVariationTable[stIndexVariationRow].lstInventory
        let dataItemModelCodeList = []
        let onChangeStockList = []
        managedInventoryList.forEach(managedInventory=>{
            const index = lstInventory.findIndex(id=>id.branchId === managedInventory.branchId)
            lstInventory[index].stock = managedInventory.serial.length
            lstInventory[index].newStock = managedInventory.serial.length
            lstInventory[index].updateStock = InventoryEnum.ACTIONS.SET_STOCK

            managedInventory.serial.forEach(code=>{
                if(props.mode === ProductFormEditorMode.EDIT){
                    if(stVariationTable.length === 0){
                        dataItemModelCodeList.push({
                            branchId: managedInventory.branchId,
                            code: code,
                            status: Constants.ITEM_MODE_CODE_STATUS.AVAILABLE
                        })
                        return
                    }

                    if (stVariationTable[stIndexVariationRow].itemModelCodeDTOS){
                        let findCode = stVariationTable[stIndexVariationRow].itemModelCodeDTOS.find(findCode =>findCode.code === code)
                        dataItemModelCodeList.push({
                            id:findCode?.id,
                            itemId:findCode?.itemId,
                            branchId: managedInventory.branchId,
                            code: code,
                            status: Constants.ITEM_MODE_CODE_STATUS.AVAILABLE
                        })
                    }else {
                        dataItemModelCodeList.push({
                            branchId: managedInventory.branchId,
                            code: code,
                            status: Constants.ITEM_MODE_CODE_STATUS.AVAILABLE
                        })
                    }
                }

                if(props.mode === ProductFormEditorMode.ADD_NEW){
                    dataItemModelCodeList.push({
                        branchId: managedInventory.branchId,
                        code: code,
                        status: Constants.ITEM_MODE_CODE_STATUS.AVAILABLE
                    })
                }
            })

            onChangeStockList.push({
                branchId: lstInventory[index].branchId,
                stock: lstInventory[index].stock,
                newStock: lstInventory[index].newStock,
                updateStock: "SET",
                orgStock: lstInventory[index].orgStock,
                sku: lstInventory[index].sku,
                orgSku: lstInventory[index].orgSku && "",
                updateType: "CHANGE",
                soldStock:lstInventory[index].soldStock
            })
        })

        lstInventory.forEach((inventory,index)=>{
            const findIndex = onChangeStockList.findIndex(branchId=>branchId.branchId === inventory.branchId)
            if (findIndex === -1){
                inventory.updateStock= "SET"
                inventory.updateType= "CHANGE"
                inventory.newStock = 0
                inventory.orgSku = ""
                onChangeStockList.push(inventory)
            }
        })


        const dataTable = {
            index: stIndexVariationRow,
            lstInventory: onChangeStockList
        }
        onSaveStock(0,"CHANGE",[dataTable])

        const clonedTable = [...stVariationTable]
        clonedTable[stIndexVariationRow].itemModelCodeDTOS = dataItemModelCodeList
        if(props.mode === ProductFormEditorMode.EDIT){
            stItemModels[stIndexVariationRow].itemModelCodeDTOS = stVariationTable[stIndexVariationRow].itemModelCodeDTOS
            setStItemModels(_.cloneDeep(stItemModels))
        }
        props.onChangeImeiModal()
    }

    const handleOpenManagedInventoryModal = (index) =>{
        setStIndexVariationRow(index)
        setStIsOpenManagedInventoryModal(true)
    }

    const handleManagedInventoryCallback = () =>{
        setStIsOpenManagedInventoryModal(false)
    }
    const listSelectedVariations = (lstItemModelIds) => {
        let selectedIds = []
        let getLstModels = []
        for (const item of lstItemModelIds){
            let plusSymbol =  item.indexOf(',')
            if(plusSymbol){
                getLstModels.push(item.split(','))
            }else{
                getLstModels.push(item)
            }
        }
        for(const groupIds of getLstModels){
            for(const data of groupIds){
                let findIdx = data.indexOf('_')
                if(findIdx){
                    let id = data.slice(findIdx + 1, data.length)
                    selectedIds.push(parseInt(id))
                }
            }
        }
        return selectedIds
    }

    return (
        <div className="product-form-variation-selector">
            <ManagedInventoryModal
                isOpenModal={stIsOpenManagedInventoryModal}
                callback={handleManagedInventoryCallback}
                branchList={props.branchList}
                dataTable={getDataForUpdateStockManagedInventory}
                indexVariation={stIndexVariationRow}
                models={stItemModels}
                mode={props.mode}
                modeVariation={true}
                variationTable={stVariationTable}
                prodName={props.prodName}
                removeVariation={stRemoveVariation}
            />


            <ProductVariationPriceEditorModal isOpen={stShowUpdatePriceModal}
                                              variationTable={stVariationTable}
                                              onCancel={onClickCancelUpdatePrice}
                                              checkedList={stCheckList}
                                              onSave={onSavePrice}
                                              modalMode={Constants.PRODUCT_VARIATION_EDITOR_MODE.VARIATION}
                                              key={stShowUpdatePriceModal}
                                              allVarsWholesale={allVarsWholesale}
                                              settingWholesale={props.settingWholesale}
                                              totalWholeSaleList={props.totalWholeSaleList}
                                              mode={props.mode}
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
                                onImageUploaded = {props.onImageUploaded}
                                callbackMode={"outerChange"}
                                chooseImageAction={onChooseImageCallback}
                                okBtnText={i18next.t("common.text.select")}
            />
            <GSModalUploadImage ref={refUpdateAllImageModal}
                                imgList={props.imgList}
                                onImageUploaded = {props.onImageUploaded}
                                callbackMode={"outerChange"}
                                chooseImageAction={onChooseUpdateAllImageCallback}
                                okBtnText={i18next.t("common.text.select")}
            />
            <ConfirmModal ref={ ref => refConfirmModal.current = ref }/>
            {/*MODAL NOTIFICATION MULTIPLE UPDATE IMEI/SERIAL*/}
            <Modal isOpen={stModalNotificationIMEI} toggle={onClickCancelModalIMEI} className="modalNotificationIMEI">
                <ModalHeader toggle={onClickCancelModalIMEI}>{i18next.t("common.txt.alert.modal.title")}</ModalHeader>
                <ModalBody>
                    {i18next.t("page.product.detail.modal.notification")}
                </ModalBody>

                <ModalFooter>
                    <GSButton success onClick={onClickCancelModalIMEI}>
                        <GSTrans t={"common.btn.ok"}/>
                    </GSButton>
                </ModalFooter>
            </Modal>

            {/*==== VARIATION HEADER =====*/}
            {stVariationRow.length > 0 &&
            <div className="row d-none d-md-flex ">
                <div className="col-12 col-md-3 p-0">
                    <label className="gs-frm-input__label">
                        <GSTrans t={'component.product.addNew.variations.name'}/>
                    </label>
                </div>
                <div className="col-md-8 w-100 variation-item-label-second">
                    <label className="gs-frm-input__label">
                        <GSTrans t={'component.product.addNew.variations.value'}/>
                    </label>
                </div>
            </div>
            }
            {/*==== VARIATION BODY =====*/}
            {stVariationRow.map(row => {
                let customErr = ''
                let isInvalid = ''
                if(checkInvalidVariation){
                    customErr = 'custom-err'
                    isInvalid = 'is-invalid'
                }
                return(
                    <div className="row variation-item-row" key={row.id}>
                        <div className="d-block d-md-none col-12 col-md-3 p-0">
                            <label className="gs-frm-input__label">
                                <GSTrans t={'component.product.addNew.variations.name'}/>
                            </label>
                        </div>
                        <div className="col-12 col-md-3 p-0 first-item d-flex">
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
                                className={(props.disabledVariation? `disabled cursor-unset ${isInvalid}` : `${isInvalid}`)}
                            />
                            <GSButton
                                className={"d-inline d-md-none product-form-variation-selector__btn-delete ml-2 " + (props.disabledVariation? 'disabled cursor-unset':'')}
                                onClick={(e) => removeVariation(e, row.id)}
                            >
                                <img src="/assets/images/icon-delete.png" alt=""/>
                            </GSButton>
                        </div>
                        <div className="d-block d-md-none col-md-8 w-100 variation-item-label-second">
                            <label className="gs-frm-input__label">
                                <GSTrans t={'component.product.addNew.variations.value'}/>
                            </label>
                        </div>
                        <div className="col-md-8 w-100 second-item">
                            <GSTags maxItemTextLength={20}
                                    maxLength={20}
                                    className={(props.disabledVariation? `product-form-variation-selector__gs-tag disabled cursor-unset ${customErr}`: `product-form-variation-selector__gs-tag ${customErr}`)}
                                    isRequired
                                    placeholder={i18next.t('component.product.addNew.variations.valueHint')}
                                    onChange={value => onVariationValuesChange(value, row.id)}
                                    defaultValue={row.values}
                                    ignoreMatchRegex={/[|]/g}
                                    confirmKeys={['Enter']}
                                    ref={refTags}
                            />
                        </div>
                        <div className="d-none d-md-block col-1 p-0 third-item">
                            <GSButton
                                className={(props.disabledVariation? 'product-form-variation-selector__btn-delete disabled cursor-unset':'product-form-variation-selector__btn-delete')}
                                onClick={(e) => removeVariation(e, row.id)}
                            >
                                <img src="/assets/images/icon-delete.png" alt=""/>
                            </GSButton>
                        </div>
                    </div>
                );
            }
            )}
            {/*======= VARIATION TABLE ======*/}
            {stVariationTable.length > MAX_ROW &&
            <AlertInline nonIcon type={AlertInlineType.ERROR} text={i18next.t('component.product.addNew.variations.max400', {max: MAX_ROW})} />
            }
            {stVariationTable.length > 0 &&
            <GSTable className={`product-form-variation-selector__table table table-responsive product-form-variation-selector__table--${stVariationTable.length > 50? 'error':'normal'}`}>
                <thead>
                {stCheckList.length > 0 && !stIsSingularSelect &&
                <tr>
                    <th colSpan={8+ stVariationRow.length}>
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
                                <GSDropdownItem onClick={() => setStShowUpdatePriceModal(true)}
                                                className={props.disabledPrice? "disabled":"cursor--pointer"}
                                >
                                    <GSTrans t={"page.product.updatePriceModal.title"}/>
                                </GSDropdownItem>
                                <GSDropdownItem onClick={onClickUpdateStock}
                                                className={props.disabledStock? "disabled":"cursor--pointer"}
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
                    </th >
                    <th className=" align-middle">
                        <GSTrans t={"page.landingPage.editor.elementEditor.image"}/>
                    </th>
                    {stVariationRow.map(row => (
                        <th key={row.id} className=" align-middle">
                            {row.name}
                        </th>
                    ))}
                    <th className="text-center input-th  align-middle">
                        <GSTrans t={"component.product.addNew.pricingAndInventory.price"}/>
                    </th>
                    <th className="text-center input-th align-middle">
                        <GSTrans t={"component.product.addNew.pricingAndInventory.discountPrice"}/>
                    </th>
                    <th className="text-center input-th align-middle">
                        <GSTrans t={"component.product.addNew.pricingAndInventory.costPrice"}/>
                    </th>
                    <th className="text-center input-th-stock align-middle">
                        <GSTrans t={"component.product.addNew.pricingAndInventory.stock"}/>
                    </th>
                    <th className="text-center input-th align-middle">
                        SKU
                    </th>
                    <th  className="text-center align-middle">
                        <GSTrans t={"page.product.list.printBarCode.barcode"}/>
                    </th>
                    <th >
                    </th>
                </tr>
                </thead>
                <tbody>
                {stVariationTable.map((row, index) => (
                    <tr key={row.var1 + (row.var2? '|'+row.var2:'') + (row.var3? '|'+row.var3:'')}>
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
                        { row.var2? <td className="align-middle">{row.var2}</td>:null}
                        { row.var3? <td className="align-middle">{row.var3}</td>:null}
                        <td className="align-middle">
                            <div className={props.disabledPrice? "disabled":"cursor--pointer"}
                                 onClick={() => onClickUpdateSingularRow(index, UPDATE_TYPE_ENUM.PRICE)}>
                                <div className=" user-event-disabled">
                                    <AvFieldCurrency className="input-min-width"
                                                     name={index + '-orgPrice'}
                                                     value={row.orgPrice}
                                                     unit={props.symbolCode}
                                                     validate={{
                                                         ...FormValidate.minValue(Constants.VALIDATIONS.PRODUCT.MIN_PRICE_OUTSIDE, true),
                                                         ...FormValidate.maxValue(Constants.VALIDATIONS.PRODUCT.MAX_PRICE, true),
                                                         ...FormValidate.required(),
                                                     }}
                                                     onBlur={(e) => onChangeOrgPrice(e, index)}
                                                     position={CurrencyUtils.isPosition(props.symbolCode)}
                                    />
                                </div>
                            </div>
                        </td>
                        <td className="align-middle">
                            <div className={props.disabledPrice? "disabled":"cursor--pointer"}
                                 onClick={() => onClickUpdateSingularRow(index, UPDATE_TYPE_ENUM.PRICE)}>
                                <div className=" user-event-disabled">
                                    <AvFieldCurrency 
                                                    className={stCheckNewPriceErrors[index]?`input-min-width is-invalid`:'input-min-width'}
                                                     name={index + '-discountPrice'}
                                                     value={row.price}
                                                     unit={props.symbolCode}
                                                     validate={{
                                                         ...FormValidate.minValue(0, true),
                                                         // ...FormValidate.required(),
                                                         ...FormValidate.async(maxDiscountPriceValidator, 100)
                                                     }}
                                                     onBlur={(e) => onChangeDiscountPrice(e, index)}
                                                    position={CurrencyUtils.isPosition(props.symbolCode)}
                                                    precision={CurrencyUtils.isCurrencyInput(props.symbolCode) && '2'}
                                                    decimalScale={CurrencyUtils.isCurrencyInput(props.symbolCode) && 2}
                                    />
                                </div>
                            </div>
                        </td>
                        <td className="align-middle">
                            <div className={props.disabledPrice? "disabled":"cursor--pointer"}
                                 onClick={() => onClickUpdateSingularRow(index, UPDATE_TYPE_ENUM.PRICE)}>
                                <div className=" user-event-disabled">
                                    <AvFieldCurrency className="input-min-width"
                                                     name={index + '-costPrice'}
                                                     value={row.costPrice}
                                                     unit={props.symbolCode}
                                                     validate={{
                                                         ...FormValidate.minValue(0, true),
                                                         ...FormValidate.maxValue(Constants.VALIDATIONS.PRODUCT.MAX_PRICE, true),
                                                         ...FormValidate.async(maxCostPriceValidator, 100),
                                                         ...FormValidate.required(),
                                                     }}
                                                     onBlur={(e) => onChangeCostPrice(e, index)}
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
                                 onClick={() => props.statusManageInventory == "PRODUCT" ? onClickUpdateSingularRow(index, UPDATE_TYPE_ENUM.STOCK) : handleOpenManagedInventoryModal(index)}>
                                <div className=" user-event-disabled">
                                    <AvFieldCurrency className="input-min-width "
                                                     name={index + '-stock'}
                                                     value={row.stock}
                                                     unit={CurrencySymbol.NONE}
                                                     onBlur={(e) => onChangeStock(e, index)}
                                                     precision={CurrencyUtils.isCurrencyInput(props.symbolCode) && '2'}
                                                     decimalScale={CurrencyUtils.isCurrencyInput(props.symbolCode) && 2}
                                    />
                                </div>
                            </div>
                            }
                            {props.mode === ProductFormEditorMode.EDIT &&
                            <GSFakeLink className={(props.disabledStock? 'disabled cursor-unset':'')}
                                        onClick={() => props.statusManageInventory == "PRODUCT" ? onClickUpdateSingularRow(index, UPDATE_TYPE_ENUM.STOCK) : handleOpenManagedInventoryModal(index)}
                            >
                                {NumberUtils.formatThousand(row.stock,'')}
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
                            <GSFakeLink  onClick={() => onClickUpdateSingularRow(index, UPDATE_TYPE_ENUM.SKU)}>
                                <GSTrans t={"page.product.editSku"}/>
                            </GSFakeLink>
                            }
                        </td>
                        <td className="align-middle">
                            <AvField className="input-min-width"
                                     name={index + '-barcode'}
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
                            <GSActionButton icon={GSActionButtonIcons.EDIT} onClick={() => onEditDetail(row)}/>
                        </td>
                    </tr>
                ))}
                </tbody>
            </GSTable>}
        </div>
    );
};
ProductFormVariationSelector.defaultProps = {
    price: 0,
    discountPrice: 0,
    sku: '',
    fullBranchList: []
}
ProductFormVariationSelector.propTypes = {
    onLengthChange: PropTypes.func,
    mode: PropTypes.string,
    onVariationRowsChange: PropTypes.func,
    imgList: PropTypes.array,
    onImageUploaded: PropTypes.func,
    depositLength: PropTypes.number,
    onEditDetail: PropTypes.func,
    onSaveStock: PropTypes.func,
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
    fullBranchList: PropTypes.arrayOf(PropTypes.shape({
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
    depositBarcodeList: PropTypes.array,
    onChange: PropTypes.func,
    onChangeImeiModal: PropTypes.func,
    disabledPrice: PropTypes.bool,
    disabledStock: PropTypes.bool,
    disabledVariation: PropTypes.bool,
    statusManageInventory:PropTypes.string,
    listInventory:PropTypes.func,
    symbolCode:PropTypes.string

};
export default React.forwardRef(ProductFormVariationSelector);
