/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 26/10/2020
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import Constants from "../config/Constant";
import {InventoryEnum} from "../pages/products/InventoryList/InventoryEnum";
import i18next from 'i18next'

const buildModelNameArray = (modelNames) => {
    const varValue = modelNames.filter(v => v !== Constants.DEPOSIT.PERCENT_100);
    return varValue.join(' | ');
}

const buildModelName = (modelName) => {
    const varValue = modelName.split('|').filter(v => v !== Constants.DEPOSIT.PERCENT_100);
    return varValue.join(' | ');
}

const buildFullModelName = (modelLabel, modelValue) => {
    const labels = modelLabel ? modelLabel.split("|") : [];
    const values = modelValue ? modelValue.split("|") : [];
    let modelNames = [];

    labels.forEach((l, i) => {
        if (l === Constants.DEPOSIT.DEPOSIT_CODE && values[i] === Constants.DEPOSIT.PERCENT_100) {
            return
        } else if (l === Constants.DEPOSIT.DEPOSIT_CODE) {
            l = i18next.t('page.product.create.variation.deposit')
        }

        modelNames.push(l + ' | ' + values[i])
    })

    return modelNames.join('\n')
}

const mapResponseToTableData = (resModels, nameList) => {
    let data = [], values = []
    if (nameList.length === 1) { //only one var


        for (let model of resModels) {
            data.push( {
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
                totalItem: model.totalItem
            })
            values.push(model.name)
        }
    } else {
        for (let model of resModels) {
            let varList



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
                totalItem: model.totalItem
            }
            varList.forEach( (name, index) => {
                dataObj = {
                    ...dataObj,
                    [`var${index+1}`]: name
                }
            })

            data.push(dataObj)
        }
    }

}

/**
 * Convert dataTable to request body
 * @param {UpdateStockDataRowInventoryModel[]} ivtRows
 *  @return BranchInventoryModel[]
 */
const mapInventoryToRequest = (ivtRows, fullBranchList) => {
    const result = ivtRows.map(ivtRow => {
        if (!ivtRow.newStock) {
            ivtRow.newStock = ivtRow.stock
        }
        if (!ivtRow.updateType) {
            ivtRow.updateType = InventoryEnum.ACTIONS.CHANGE_STOCK
        }

        return ({
            branchId: ivtRow.branchId,
            inventoryCurrent: ivtRow.orgStock,
            inventoryStock: ivtRow.updateType.toUpperCase() === InventoryEnum.ACTIONS.CHANGE_STOCK.toUpperCase()? ivtRow.newStock - ivtRow.orgStock: ivtRow.newStock,
            inventoryType: ivtRow.updateType || InventoryEnum.ACTIONS.CHANGE_STOCK,
            inventoryActionType: InventoryEnum.ACTION_TYPES.FROM_CREATE_AT_ITEM_SCREEN,
            sku: ivtRow.sku
        })})

    if (!fullBranchList?.length) {
        return result
    }

    return fullBranchList.map(({ id }) => {
        const existEnvRow = result.find(({ branchId }) => branchId === id)

        if (!existEnvRow) {
            return {
                branchId: id,
                inventoryCurrent: 0,
                inventoryStock: 0,
                inventoryType: InventoryEnum.ACTIONS.CHANGE_STOCK,
                inventoryActionType: InventoryEnum.ACTION_TYPES.FROM_CREATE_AT_ITEM_SCREEN,
                sku: ''
            }
        }

        return existEnvRow
    })
}

/**
 * Map item branches to lstInventory
 * @param {BranchInventoryModel} branches
 * @param mode
 * @return {UpdateStockDataRowInventoryModel[]}
 */
const mapBranchesToLstInventory = (branches, mode = 'init') => {
    switch (mode) {
        case "init":
            return branches.map(branch => ({
                branchId: branch.id,
                stock: 0,
                newStock: 0,
                updateStock: InventoryEnum.ACTIONS.SET_STOCK,
                orgStock: 0,
                sku: ''
            }))
        default:
            return []
    }
}

const escape100Percent = (name) => {
    return name?.replaceAll(/( |\|)\[100P3rc3nt]/g, '')
}

const escapeDepositPercent = (name) => {
    return name?.replaceAll(/( |\|)\[d3p0s1t]/g, '')
}

const computeItemModelId = (itemId, modelId) => {
    return String(modelId ? itemId + '-' + modelId : itemId)
}

const computeItemModelIdV2 = (itemId, modelId) => {
    return String(modelId ? itemId + '_' + modelId : itemId)
}

const changeNameToLink = str => {
    str = str.replace(/??|??|???|???|??|??|???|???|???|???|???|??|???|???|???|???|???/g, 'a');
    str = str.replace(/??|??|???|???|???|??|???|???|???|???|???/g, 'e');
    str = str.replace(/??|??|???|???|??/g, 'i');
    str = str.replace(/??|??|???|???|??|??|???|???|???|???|???|??|???|???|???|???|???/g, 'o');
    str = str.replace(/??|??|???|???|??|??|???|???|???|???|???/g, 'u');
    str = str.replace(/???|??|???|???|???/g, 'y');
    str = str.replace(/??/g, 'd');
    str = str.replace(/??|??|???|???|??|??|???|???|???|???|???|??|???|???|???|???|???/g, 'A');
    str = str.replace(/??|??|???|???|???|??|???|???|???|???|???/g, 'E');
    str = str.replace(/??|??|???|???|??/g, 'I');
    str = str.replace(/??|??|???|???|??|??|???|???|???|???|???|??|???|???|???|???|???/g, 'O');
    str = str.replace(/??|??|???|???|??|??|???|???|???|???|???/g, 'U');
    str = str.replace(/???|??|???|???|???/g, 'Y');
    str = str.replace(/??/g, 'D');
    str = str.replace(/\W+/g, ' ');
    str = str.replace(/\s/g, '-');
    return str.toLowerCase();
}

const sortByParentId = (products) => {
    if (!products || !_.isArray(products)) {
        return []
    }

    return _.orderBy(products.map(p => {
        p.sortParentId = p.parentId || p.id
        return p
    }), ['sortParentId'], ['asc'])
}

export const ItemUtils = {
    buildModelNameArray,
    buildModelName,
    buildFullModelName,
    mapResponseToTableData,
    mapInventoryToRequest,
    mapBranchesToLstInventory,
    escape100Percent,
    computeItemModelId,
    computeItemModelIdV2,
    changeNameToLink,
    sortByParentId
}
