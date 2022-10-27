import React, { useState, useRef, useEffect } from 'react';
import { withRouter, useParams } from "react-router-dom";
import {AvField, AvForm} from "availity-reactstrap-validation";
import {Trans} from "react-i18next";
import i18next from "i18next";
import _ from 'lodash';

import GSContentBody from "@layout/contentBody/GSContentBody";
import GSContentContainer from "@layout/contentContainer/GSContentContainer";
import { NAV_PATH } from "@layout/navigation/Navigation";

import AddVariationModal from "@shared/AddVariationModal/AddVariationModal"
import CryStrapInput from "@shared/form/CryStrapInput/CryStrapInput";
import ConfirmModal from "@shared/ConfirmModal/ConfirmModal";
import GSComponentTooltip, {
    GSComponentTooltipPlacement,
} from "@shared/GSComponentTooltip/GSComponentTooltip";
import GSTrans from "@shared/GSTrans/GSTrans";
import GSButton from "@shared/GSButton/GSButton";
import GSWidget from "@shared/form/GSWidget/GSWidget";
import LoadingScreen from "@shared/LoadingScreen/LoadingScreen";
import Loading, {LoadingStyle} from "@shared/Loading/Loading";
import GSFakeLink from "@shared/GSFakeLink/GSFakeLink";
import GSPagination from '@shared/GSPagination/GSPagination'
import GarbageIcon from '@shared/GSSvgIcon/Garbage';

import Constants from "@config/Constant";
import {FormValidate} from "@config/form-validate";

import {ItemService} from "@services/ItemService";

import {CurrencyUtils} from "@utils/number-format";
import {CredentialUtils} from "@utils/credential";
import {GSToast} from "@utils/gs-toast";
import {ItemUtils} from "@utils/item-utils";
import { RouteUtils } from "@utils/route";

import DropdownMultiSelect from "./CustomerSegmentDropdown/DropdownMultiSelect";
import { ProductFormEditorMode } from '../ProductFormEditor/ProductFormEditor';
import './ProductWholesalePrice.sass';

export const ProductWholesaleEditMode = {
    ADD_NEW: 'addNew',
    EDIT: 'edit'
}

const ERROR_KEY = {
    MIN_VALUE: 'common.validation.number.min.value',
    MAX_VALUE: 'common.validation.number.max.value',
    EQUAL_LOWER_COST_PRICE:"common.validation.costPrice.value",
    EQUAL_HIGHER_ORG_PRICE:"common.validation.orgPrice.value",
    PRICE_PER_ITEM: 'component.wholesalePrice.error.price_per_item',
    RANGE_PRICE:'component.wholesalePrice.value.must.be.range',
    NONE: '',
    DUPLICATE_WHOLESALE: 'component.wholesalePrice.error.duplicate_wholesale_price',
    ERROR_DUPLICATE: 'duplicate',
    WARNING_ANY_CONFIG_WHOLESALE: 'component.wholesalePrice.warning.dont_configure_any_wholesale_price',
    WARNING_ANY_CONFIG_VARIATION:'component.wholesalePrice.warning.dont_configure_any_variation'
}

const VALIDATE_INPUT = {
    MIN: 1,
    MAX_QUANTITY: 1000000,
    MAX_PRICE: 99999999999,
    MAX_CHAR: 30,
    ROW: 5,
    MAX_ROW: 2000,
    PAGING: 100
}

const SIZE_WHOLESALE = 2000

const ProductWholesalePrice = (props) => {

    const [onRedirect, setOnRedirect] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [onChange, setOnChange] = useState(false);
    const [stWholesalePrice, setStWholesalePrice]= useState([]);
    const [stWholesalePriceEdit, setStWholesalePriceEdit]= useState([]);
    const [isClosedDropdownSegment, setIsClosedDropdownSegment] = useState(true);

    const [duplicateWholesaleErrors, setDuplicateWholesaleErrors] = useState([]);
    const [stDiscountErrors, setStDiscountErrors] = useState([]);
    const [stPricePerItemErrors, setStPricePerItemErrors] = useState([]);
    const [stBuyFromErrors, setStBuyFromErrors] = useState([]);
    const [stCustomerSegmentErrors, setStCustomerSegmentErrors] = useState([])
    const [stIsSaving, setStIsSaving] = useState(false);
    const [enableSaving, setEnableSaving] = useState(false)
    const [hasModel, setHasModel] = useState(false);
    const [models, setModels] = useState([]);
    const [salePrice, setSalePrice] = useState(0);
    const [stIsShowCustomerSegmentModal, setStIsShowCustomerSegmentModal] = useState(false);
    const [groupItemModelWholesale, setGroupItemModelWholesale] = useState([]);
    const [allSelectedVariationIds, setAllSelectedVariationIds] = useState([]);
    const [stSelectedGroupVars, setStSelectedGroupVars] = useState([]);
    const [stSelectedByModels, setStSelectedByModels] = useState("");

    const [isEditByModels, setIsEditByModels] = useState(false);
    const [isErrors, setIsErrors] = useState(false);
    const [stListSegment, setStListSegment] = useState([{id:"ALL", name: i18next.t('component.navigation.customers.allCustomers')}]);
    const [errFetchData, setErrFetchData] = useState(false);
    const [isFetchingItem, setIsFetchingItem] = useState(false);
    const [isFetchingWholesale, setIsFetchingWholesale] = useState(false);
    const [totalWholesale, setTotalWholesale] =  useState(0);
    const [stItem, setStItem] =  useState({});
    const [stNonExistedSegmentEdit, setStNonExistedSegmentEdit] = useState([]);

    let refConfirmModal = useRef();
    let refProdCostPrice= useRef();
    const langKey = CredentialUtils.getLangKey();
    let isClosedSegment = true

    let { itemId } = useParams();

    useEffect(() => {
        fetchWholesalePricing(itemId)
        fetchItem(itemId)
    }, [])

    const handleModelWithoutDeposit = (models) => {
        if(!models.find(model => model.label.includes("[d3p0s1t]"))) return models
        const excludedDeposit = models.filter(model => model.name.includes("[100P3rc3nt]"));
       return excludedDeposit
    }

    const fetchItem =(itemId) => {
        setIsFetchingItem(true)
        ItemService.fetch(itemId)
        .then(async result => {
            setIsFetchingItem(false)
            if(result){
                setSalePrice(result.newPrice)
                setHasModel(result.hasModel)
                let filterModel = handleModelWithoutDeposit(result?.models)
                if(filterModel.length > 0){
                    setModels(filterModel)
                }else{
                    setModels([])
                    setHasModel(false)
                }

            }
            setStItem(result)
            setErrFetchData(false)
            if(result.currency !== Constants.CURRENCY.VND.SYMBOL){
                VALIDATE_INPUT.MIN = 0
            }

        })
        .catch((err) => {
            console.log(err)
            setErrFetchData(true)
        })
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

    const checkExistedSegmentItem = (list) => {
        let getList = []
        list.forEach(data => {
            data.paging.content.forEach(r => {
                if(r.id && !r.segmentIds) {
                    getList.push(r.id)
                }
            })
        })
        setStNonExistedSegmentEdit(getList)
    }

    const fetchWholesalePricing = (itemId, page=0) => {
        setIsFetchingWholesale(true)
        setStWholesalePrice([])
        ItemService.getAllWholesalePrice(itemId, page)
            .then(result => {
                if((props.mode === ProductFormEditorMode.ADD_NEW && result.total > 0) || (props.mode === ProductFormEditorMode.EDIT && result.total === 0)){
                    renderBackProductDetail()
                }
                setIsFetchingWholesale(false)
                setStWholesalePrice(result.lstResult)
                checkExistedSegmentItem(result.lstResult)
                let listVars = listSelectedVariations(result.lstItemModelIds)
                if(listVars.length === 1 && listVars[0] == itemId){
                    return
                }else{
                    setAllSelectedVariationIds(listVars)
                    setGroupItemModelWholesale(result.lstItemModelIds)
                }
                setTotalWholesale(result.total)
                setErrFetchData(false)
            })
            .catch((err) => {
                console.log(err)
                setErrFetchData(true)
                setIsFetchingWholesale(false)
            })
    }

    const getNameOfItemModels = (models, itemModelIds) => {
        let listName = []
        if(!models) return
        let getModel = models.filter(r => itemModelIds.includes(String(itemId) + "_" + String(r.id)));
        if(getModel){
            for(const {name} of getModel){
                let formatName = ItemUtils.escape100Percent(name)
                listName.push(formatName + ', ')
            }
        }
        return listName
    }

    const checkAllErrors = (array) => {
        // return array.some( item => (item !== '' && item !== undefined) )
        for(const {errors} of array){
            return errors.some( item => (item !== '' && item !== undefined) )
        }
    }

    const checkEmptyContent  = () => {
        let findEmpty = stWholesalePrice.find(r => r.paging.content.length === 0)
        if(findEmpty) {
            setStWholesalePrice(prev => {
                let list = prev.filter(r => r.paging.content.length === 0)
                for (const item of list){
                    item.checkEmpty = true
                }
                return[...prev]
            })
            setEnableSaving(false)
            return true
        }
    }

    const handleOnSaveSubmit = () => {

        if(checkAllErrors(stPricePerItemErrors)|| checkAllErrors(stBuyFromErrors) || checkAllErrors(duplicateWholesaleErrors)) return
        let request = {
            itemId: itemId,
            langKey: langKey,
            lstWholesalePricingDto: []
        }
        const dataTable = []
        let fetchData = []
        if(props.mode === ProductFormEditorMode.EDIT){
            fetchData = stWholesalePriceEdit
        }else{
            fetchData = stWholesalePrice
        }
        for (const {paging} of fetchData){

            for (const {title, currency, itemId, minQuatity, modelId, price, segmentIds, itemModelIds, action, flag, id} of paging.content) {
                let getId
                if(flag === 'NEW') {
                    getId = null
                }else{
                    getId = id
                }
                let data = {
                    id: getId,
                    title: title,
                    minQuatity: parseInt(minQuatity),
                    itemModelIds: itemModelIds,
                    currency: currency,
                    price: isSymbolValue(price,stItem.currency),
                    segmentIds:segmentIds?segmentIds:'ALL',
                    itemId: itemId,
                    modelId: modelId,
                    action: flag === 'DELETE'?'delete':action,
                }
                dataTable.push(data)
            }
        }
        request.lstWholesalePricingDto = dataTable

        checkValidateRow(request.lstWholesalePricingDto)
        if(validateRowItems(request.lstWholesalePricingDto)) return
        if(checkEmptyContent()) return
        if(props.mode === ProductFormEditorMode.EDIT){
            let getListIds = dataTable.filter(r=> r.id !== null).map(r => r.id)
            if(!stNonExistedSegmentEdit.every(item => getListIds.includes(item))){
                GSToast.error(i18next.t("component.wholesalePrice.no.select.any.customer.segment"))
                setEnableSaving(false)
                return
            }  
        }

        setStIsSaving(true)
        ItemService.updateWholeSalePrice(request)
        .then((result) => {
            setEnableSaving(false)
            if(result?.status === 1){
                GSToast.commonUpdate()
                setOnChange(false)
                setOnRedirect(true)
                RouteUtils.redirectWithoutReload(props, NAV_PATH.productEdit + '/' + itemId)

            }else if(result?.status === 0){
                if(result?.message === 'item.wholesale.pricing.error.conflict'){
                    GSToast.error(i18next.t("component.wholesalePrice.error.duplicate_wholesale_price"))
                }else{
                     GSToast.commonError()
                }
            }
        })
        .catch(e => {
            console.log('error:', e)
            GSToast.commonError()
        })
        .finally(() => {
            setStIsSaving(false)
            if (props.onSave) props.onSave()
        })

    }
    const removeData = (itemModelIds, segmentIds) => {
        setStWholesalePrice(prev => {
            prev = prev.filter(r => r.itemModelIds !== itemModelIds)
            return [...prev]
        })
        setStWholesalePriceEdit(prev => {
            prev = prev.filter(r => r.itemModelIds !== itemModelIds)
            return [...prev]
        })
        setStSelectedGroupVars(prev => {
            prev = prev.filter(r => r !== itemModelIds)
            return [...prev]
        })
        if(!segmentIds) return
        setAllSelectedVariationIds(prev => {
            prev = prev.filter(r => !segmentIds.includes(r) )
            return [...prev]
        })
        setDuplicateWholesaleErrors(prev =>{
            prev = prev.filter(r => r.itemModelIds !== itemModelIds)
            return [...prev]
        })
    }

    const removeItemModel = (itemModelIds, action) => {
        let listVars = listSelectedVariations([itemModelIds])

        if(props.mode === ProductWholesaleEditMode.ADD_NEW || action === 'NEW'){
            removeData(itemModelIds, listVars)
            setOnChange(true)
            setEnableSaving(true)
        }else{
            refConfirmModal.current.openModal({
                messages: i18next.t('component.product.addNew.cancelHint'),
                // okCallback: renderConfigWholesalePrice
                okCallback: () => handleRemoveByItemModelIds(itemModelIds, listVars)
            })
        }

    }

    const handleRemoveByItemModelIds = (itemModelIds, segmentIds) => {
        setStIsSaving(true)
        ItemService.deleteWholeSalePriceByModel(itemId,itemModelIds)
            .then(result => {
                if(result.status === 1){
                    GSToast.commonUpdate()
                    setStIsSaving(false)
                    // setTimeout(() => {
                    //     window.location.reload()
                    // }, 700);
                    removeData(itemModelIds, segmentIds)
                    setOnChange(true)
                    setEnableSaving(true)
                }else{
                    GSToast.error(result.description);
                    console.log('error:', result)
                }
            })
            .catch((err) => {
                GSToast.commonError()
                console.log(err)
            })
    }

    const removeWholesalePriceRow = (e, id, index, groupIndex) => {
        // e.preventDefault()
        let wholesale = stWholesalePrice.find(v => v.itemModelIds === groupIndex)
        let err = ''
        let data = {
            itemModelIds : groupIndex,
            paging :{
                content: [],
            }
        }
        if(props.mode === ProductFormEditorMode.EDIT) {
            let clonedWholesale = _.cloneDeep(wholesale)
            let item = clonedWholesale.paging.content.find(r=> r.id === id)
            if(item.flag && item.flag === "NEW"){
                setStWholesalePriceEdit(prev => {
                    let row = prev.find(v => v.itemModelIds === groupIndex)
                    if(row){
                        row.paging.content = row.paging.content.filter(r=> r.id !== id)
                    }
                    return [...prev];
                })
            }else{
                item.flag = "DELETE"
                data.paging.content.push(item)
                setStWholesalePriceEdit(prev => {
                    let row = prev.find(v => v.itemModelIds === groupIndex)
                    if(row){
                        row.paging.content.push(item)
                    } else prev.push(data)

                    return [...prev];
                })
            }
        }
        setStWholesalePrice(prev => {
            let row = prev.find(v => v.itemModelIds === groupIndex)
            if(row){
                row.paging.content = row.paging.content.filter(r=> r.id !== id)
                row.paging.totalElements -= 1
            }
            return [...prev];
        })
        setStBuyFromErrors(prev => {
            let row = prev.find(r => r.itemModelIds === groupIndex)
            if(row){
                row.errors[index] = err
            }
            return [...prev];
        })
        setStPricePerItemErrors(prev => {
            let row = prev.find(r => r.itemModelIds === groupIndex)
            if(row){
                row.errors[index] = err
            }
            return [...prev];
        })

        let clonedWholesale = _.cloneDeep(wholesale)
        let content = clonedWholesale.paging.content.filter(r=> r.id !== id)
        clonedWholesale.paging.content = content
        checkDuplicateWholesale(clonedWholesale, groupIndex)
        setEnableSaving(true)
        setOnChange(true)
    }

    const onChangeWholesaleTitle = (e, index, grIndex, id, itemIndex) => {
        const { value, name } = e.currentTarget;
        let wholesale = [...stWholesalePrice];
        let data = {
            itemModelIds: grIndex,
            paging: {
                content: []
            }
        }

        wholesale = stWholesalePrice.find(r => r.itemModelIds === grIndex)
        if(value === wholesale.paging.content[index].title) return
        wholesale.paging.content[index].title = value
        wholesale.paging.content[index].flag = "EDIT"

        if(props.mode === ProductFormEditorMode.EDIT) changeWholesaleEdit('title', value, id, index, grIndex, wholesale, data, itemIndex)
        setEnableSaving(true)
        setOnChange(true)
    }

    const validateBuyFrom = (quantity, index, grIndex) => {

        let err = '';
        if(!quantity || quantity === undefined){
            err = i18next.t(ERROR_KEY.PRICE_PER_ITEM, {x : CurrencyUtils.formatThousand(VALIDATE_INPUT.MIN), y : CurrencyUtils.formatThousand(VALIDATE_INPUT.MAX_QUANTITY)})
        }else if(parseInt(quantity) < VALIDATE_INPUT.MIN || parseInt(quantity) > VALIDATE_INPUT.MAX_QUANTITY){
            err = i18next.t(ERROR_KEY.RANGE_PRICE, {x: CurrencyUtils.formatThousand(VALIDATE_INPUT.MIN), y:CurrencyUtils.formatThousand(VALIDATE_INPUT.MAX_QUANTITY)})
        }else{
            err = ''
        }
        let data = {
            itemModelIds: grIndex,
            errors : [err]
        }
        setStBuyFromErrors(prev => {
            let row = prev.find(r => r.itemModelIds === grIndex)
            if(row){
                row.errors[index] = err
            }else{
                prev.push(data)
            }
            return [...prev];
        })
        return err
    }

    const onChangeBuyFrom = (e, index, grIndex, id, itemIndex) => {
        // e, index, item.itemModelIds, parentInx, item.id
        const {value, name} = e.currentTarget
        let wholesale = [...stWholesalePrice];
        let data = {
            itemModelIds: grIndex,
            paging: {
                content: []
            }
        }

        wholesale = stWholesalePrice.find(r => r.itemModelIds === grIndex)
        if(parseInt(value) === wholesale.paging.content[index].minQuatity) return
        if(!wholesale.paging.content[index].flag) wholesale.paging.content[index].flag = "EDIT"
        wholesale.paging.content[index].minQuatity = parseInt(value);
        if(props.mode === ProductFormEditorMode.EDIT) changeWholesaleEdit('minQuatity', value, id, index, grIndex, wholesale, data, itemIndex)
        validateBuyFrom(value, index, grIndex);
        checkDuplicateWholesale(wholesale, grIndex);
        checkValidateRow(wholesale.paging.content)
        setEnableSaving(true)
        setOnChange(true)
    }

    const checkMinMaxInputPrice = (price, key = 'PRICE_PER_ITEM') => {
        let error = ERROR_KEY.NONE
        const parsedPrice = parseFloat(price)
        // if (isNaN(parsedPrice) && parsedPrice == null) return

        if (parsedPrice < VALIDATE_INPUT.MIN || parsedPrice > VALIDATE_INPUT.MAX_PRICE) {
            error = i18next.t(ERROR_KEY[key], {x: CurrencyUtils.formatThousand(VALIDATE_INPUT.MIN), y: CurrencyUtils.formatThousand(VALIDATE_INPUT.MAX_PRICE)})
        }
        return error
    }

    const validatePricePerItem = (priceItem, index, grIndex, defaultPrice) => {

        let error = ''
        if(isNaN(priceItem) || priceItem === undefined){
            error = i18next.t(ERROR_KEY.PRICE_PER_ITEM, {x : CurrencyUtils.formatThousand(VALIDATE_INPUT.MIN), y : CurrencyUtils.formatThousand(VALIDATE_INPUT.MAX_PRICE)})
        }else if(parseFloat(priceItem) > parseFloat(defaultPrice)){
            error = i18next.t('component.wholesalePrice.error.wholesale_price_higher_sale_price')
        }
        if(checkMinMaxInputPrice(priceItem)) error = checkMinMaxInputPrice(priceItem)
        let data = {
            itemModelIds: grIndex,
            errors : [error]
        }
        setStPricePerItemErrors(prev => {
            let row = prev.find(r => r.itemModelIds === grIndex)
            if(row){
                row.errors[index] = error
            }else{
                prev.push(data)
            }
            return [...prev];
        })
        return error
    }

    const onChangePricePerItem = (value, index, grIndex, id, defaultPrice, itemIndex) => {
        // const { value } = e.currentTarget;
        let wholesale = [...stWholesalePrice];
        let data = {
            itemModelIds: grIndex,
            paging: {
                content: []
            }
        }

        wholesale = stWholesalePrice.find(r => r.itemModelIds === grIndex)
        if(parseFloat(value) == wholesale.paging.content[index].price) return
        if(!wholesale.paging.content[index].flag) wholesale.paging.content[index].flag = "EDIT"
        wholesale.paging.content[index].price = parseFloat(value);
        wholesale.paging.content[index].newPrice = parseFloat(defaultPrice);

        if(props.mode === ProductFormEditorMode.EDIT) changeWholesaleEdit('price', value, id, index, grIndex, wholesale, data, itemIndex)
        validatePricePerItem(value, index, grIndex, parseFloat(defaultPrice));

        const discountItem = discountPercentage(value, defaultPrice);
        if(!discountItem) return
        wholesale.paging.content[index].discount = discountItem
        checkValidateRow(wholesale.paging.content)
        setEnableSaving(true)
        setOnChange(true)
    }

    const onChangeCustomerSegment = (segment, index, grIndex, id, itemIndex) => {
        let segmentIds = 'ALL'
        if(segment){
            if(segment.length !== 0){
                segmentIds = segment.join(',')
            }
        }
        let data = {
            itemModelIds: grIndex,
            paging: {
                content: []
            }
        }

        let wholesale = [...stWholesalePrice];
        wholesale = stWholesalePrice.find(r => r.itemModelIds === grIndex)
        if(segmentIds === wholesale.paging.content[index].segmentIds) return
        if(!wholesale.paging.content[index].flag) wholesale.paging.content[index].flag = "EDIT"
        wholesale.paging.content[index].segmentIds = segmentIds
        if(props.mode === ProductFormEditorMode.EDIT) changeWholesaleEdit('segmentIds', segmentIds, id, index, grIndex, wholesale, data, itemIndex)
        checkDuplicateWholesale(wholesale, grIndex);
        checkValidateRow(wholesale.paging.content)
        setEnableSaving(true)
        setOnChange(true)
    }

    const changeWholesaleEdit = (key, value, id, index, grIndex, wholesale, data, itemIndex) => {

        setStWholesalePriceEdit(prev => {
            const list = prev.find(r => r.itemModelIds === grIndex)
            if(list){
                let content = list.paging.content.find(r => {
                    if(id !== null){
                        return r.id === id
                    }else{
                        return r.index === itemIndex
                    }
                })
                if(content){
                    content[key] = String(value)
                    // content.isEmpty = false
                    // content[index].flag = "EDIT"
                }else{
                    // list.isEmpty = false
                    list.paging.content.push(wholesale.paging.content[index])
                }
            }
            else{
                data.paging.content.push(wholesale.paging.content[index])
                // data.isEmpty = false
                prev.push(data)
            }
            return [...prev];
        })
    }

    const discountPercentage = (wholesalePrice, sellingPrice) => {
        const isCurrency = stItem.currency === Constants.CURRENCY.VND.SYMBOL
        let discount = isCurrency ?  `0 ${stItem.currency} (0.00%)` : `${stItem.currency} 0 (0.00%)`
        if(!wholesalePrice || wholesalePrice < 0) return discount
        const discountAmount = parseFloat(sellingPrice) - parseFloat(wholesalePrice);
        if(!discountAmount ||  discountAmount < 0) return discount
        const percentage = (discountAmount*100)/sellingPrice;
        return `${CurrencyUtils.formatThousand(discountAmount,stItem.currency)} (${Math.floor(percentage * 100) / 100}%)`
    }

    const checkValidateRow = (data) => {
        data.map((_var, index) => {
            // validateBuyFrom(_var.minQuatity, index);
            // validatePricePerItem(_var.price, index);
            return validateBuyFrom(_var.minQuatity, index, _var.itemModelIds) & validatePricePerItem(_var.price, index, _var.itemModelIds, _var.newPrice);
        })
    }

    const validateRowItems = (data, grIndex) => {
        let error = false
        data.map((_var, index) => {
            if(validateBuyFrom(_var.minQuatity, index, grIndex) || validatePricePerItem(_var.price, index, grIndex) ){
                return error = true
            }
        })
        return error
    }

    const checkDuplicateWholesale = (wholesaleList, grIndex) => {
        if(!wholesaleList || wholesaleList.paging.content.length < 1) return
        let dataErrors = {
            itemModelIds: grIndex,
            errors: [],
            duplicate: false
        }
        let data = []
        const duplicateErrors = []

        wholesaleList.paging.content.map((item, index) => {
            //for each item in arrayOfObjects check if the object exists in the resulting array
            let error = ''
            if(data.find((object, idx) => {

                if(parseFloat(object.minQuatity) === parseFloat(item.minQuatity) && object.segmentIds === item.segmentIds) {
                    //if the object exists iterate times
                    object.times++;
                    error = 'duplicate'
                    return true;
                    //if it does not return false
                } else return false;
            })){
            } else {
                //if the object does not exists push it to the resulting array and set the times count to 1
                item.times = 1;
                error = ''
                data.push({segmentIds: item.segmentIds, minQuatity: item.minQuatity, times: item.times});
            }
            duplicateErrors[index] = error
            return data
        })
        let getDuplicate = data.filter(r => r.times > 1)
        if(getDuplicate.length > 0) {
            dataErrors.errors = getDuplicate
            dataErrors.duplicate = true
            setIsErrors(true)
        }else{
            dataErrors.errors = []
            dataErrors.duplicate = false
            setIsErrors(false)
        }
        setDuplicateWholesaleErrors(prev => {
            let row = prev.find(r => r.itemModelIds === grIndex)
            if(row){
                // row = dataErrors
                row.errors = getDuplicate
                row.duplicate = dataErrors.duplicate
            }else prev.push(dataErrors)

            return [...prev]
        })
    }

    const getItemModelIds = (data) => {
        let list = []
        let itemModelIds = ""
        for(const item of data){
            list.push(itemId + '_' + item)
        }
        itemModelIds = list.join(',')
        return itemModelIds
    }

    const addVariation = (itemModelIds) => {
        if(itemModelIds){
            let ids = []
            let groupModelIds = itemModelIds.split(",");
            if(groupModelIds){
                for (const value of groupModelIds ){
                    let idx = value.indexOf("_")
                    if(idx) {
                        let id = value.slice(idx+1, value.length)
                        ids.push(parseInt(id))
                    }
                }
            }
            setStSelectedGroupVars(ids)
            setStSelectedByModels(ids)
            setIsEditByModels(true)
        }
        setStIsShowCustomerSegmentModal(!stIsShowCustomerSegmentModal);
    }

    const checkMaxSizeWholesale = (totalElements) => {
        //have not check maximum for wholesale size
        if(totalElements === SIZE_WHOLESALE && !hasModel){
            setIsErrors(i18next.t('component.wholesalePrice.error.maximum.wholesale.size'))
            return true
        }
    }

    const addNewWholesalePrice = (grIndex, newPrice, defaultIndex, newGroup, segmentIds) => {
        let data = {
            itemModelIds : grIndex,
            newPrice: newPrice,
            paging :{
                content: [],
                totalElements: 0
            },
            action: 'NEW',
            checkEmpty: false,
            segmentIds: segmentIds ? segmentIds : null,
        }
        const newIndex = Date.now()
        const newVar = {
            id: null,
            index: newIndex,
            minQuatity: 1,
            itemId: itemId,
            itemModelIds: grIndex,
            title: i18next.t('component.wholesalePrice.title', {x: defaultIndex}),
            currency: 'đ',
            segmentIds: 'ALL',
            action: null,
            price: newPrice,
            duplicate: 0,
            flag: 'NEW',
            discount: '0',
            newPrice: newPrice,
        }

        let wholesale = [...stWholesalePrice]
        wholesale = stWholesalePrice.find(r => r.itemModelIds === grIndex)

        if(wholesale){
            // if(checkMaxSizeWholesale(wholesale.paging.totalElements)) return
            if(validateRowItems(wholesale.paging.content, grIndex)) return

            // check it is the first time create wholesale or not
            if(props.mode === ProductWholesaleEditMode.EDIT){
                setStWholesalePriceEdit(prev => {
                    let row = prev.find(r => r.itemModelIds === grIndex)
                    if(row){
                        row.paging.content.push(newVar)
                    }else{
                        if(newGroup !== 'newGroup') {
                            data.paging.content.push(newVar)
                        }
                        data.isEmpty = false
                        data.paging.totalElements += 1
                        prev.push(data)
                        // prev.push(data)
                    }
                    return [...prev];
                })
            }
            setStWholesalePrice(prev => {
                let row = prev.find(r => r.itemModelIds === grIndex)
                if(row){
                    row.paging.content.push(newVar)
                    row.isEmpty = false
                    row.paging.totalElements += 1
                }
                return [...prev];
            })
            if(wholesale.paging.content.find(r=> r.index === newIndex)){
                checkDuplicateWholesale(wholesale, grIndex)
            }else{
                const wholesaleNew = _.cloneDeep(wholesale)
                wholesaleNew.paging.content.push(newVar)
                checkDuplicateWholesale(wholesaleNew, grIndex)
            }
        }else{
            if(props.mode === ProductWholesaleEditMode.EDIT){
                setStWholesalePriceEdit(prev => {
                    let row = prev.find(r => r.itemModelIds === grIndex)
                    if(row){
                        row.paging.content.push(newVar)
                        row.paging.totalElements += 1
                    }
                    return [...prev];
                })
            }
            if(newGroup !== 'newGroup') {
                data.paging.content.unshift(newVar)
            }
            else {
                data.paging.content = []
            }
            data.paging.totalElements = data.paging.content.length
            setStWholesalePrice(stWholesalePrice => ([data, ...stWholesalePrice]))
            setGroupItemModelWholesale(list => [...list, grIndex])
        }
         setEnableSaving(true)
        // setStSelectedGroupVars(prev => [...prev, grIndex])
        setOnChange(true)
    }

    const onCloseSelectedVariation = (segmentIds) => {
        setStIsShowCustomerSegmentModal(false)

        let getAllSelected = [...allSelectedVariationIds]
        if(segmentIds){
            let items = models.find(r => segmentIds.includes(r.id))
            let itemModelIds =  getItemModelIds(segmentIds)
            let prevSelected = getItemModelIds(stSelectedByModels)
            if(isEditByModels) {
                if(props.mode === ProductWholesaleEditMode.ADD_NEW){
                    const wholesale = stWholesalePrice.find(r => r.itemModelIds === prevSelected)
                    if(wholesale){
                        wholesale.itemModelIds = itemModelIds
                    }
                    let getGroup = groupItemModelWholesale.find(r => r === prevSelected)
                    if(getGroup) getGroup = itemModelIds

                }else{
                    updateVariationByGroupItemModel(itemModelIds)
                }
            }else{
                addNewWholesalePrice(itemModelIds, items.newPrice, 1, 'newGroup', segmentIds)
                getAllSelected = getAllSelected.concat(segmentIds)
                setAllSelectedVariationIds(getAllSelected)
            }
        }
        setStSelectedGroupVars([])
        setStSelectedByModels("")
        setIsEditByModels(false)
    }

    const updateVariationByGroupItemModel = (itemModelIdsNew) => {
        let oldModels = getItemModelIds(stSelectedGroupVars)
        let request = {
            itemId: parseInt(itemId),
            itemModelIdsOld: oldModels,
            itemModelIdsNew : itemModelIdsNew
        }
        setEnableSaving(true)
        ItemService.updateVariationByGroupItemModel(request)
        .then(() => {
            setTimeout(() => {
                GSToast.commonUpdate()
                window.location.reload()
            }, 500)
        })
        .catch(e => {
            console.log('error:', e)
            GSToast.commonError()
        })
        .finally(() => {
            setStIsSaving(false)
            if (props.onSave) props.onSave()
        })
    }

    const renderBackProductDetail = () => {
        RouteUtils.redirectWithoutReload(props, NAV_PATH.productEdit + `/${itemId}`)
    }

    const onChangePage = (page, itemModelIds) => {
        if(!hasModel){
            let listWholesale = []
            ItemService.getAllWholesalePrice(itemId, page-1)
            .then((result) => {
                setStWholesalePrice([])
                if(result){
                    listWholesale = result.lstResult
                    setStWholesalePrice(listWholesale)
                }
            })
            .catch((e) => {
                console.log(e)
            })
        }else{
            getWholeSalePriceByModel(itemModelIds, page - 1)
        }
    }

    const getWholeSalePriceByModel = (itemModelIds, page) => {

        ItemService.getWholeSalePriceByModel(itemId, itemModelIds, page)
        .then((result) => {
            if(!result) return
            if(stWholesalePrice.find(r => r.itemModelIds)){
                setStWholesalePrice(prev => {
                    let row = prev.find(r => r.itemModelIds === itemModelIds)
                    if(row){
                        row.paging = result
                    }
                    return [...prev];
                })
            }
        })
        .catch((e)=>{
            console.log(e)
        })
    }

    const addNewWholesaleByModel = (itemModelIds, salePrice, defaultIndex) => {
        const duplicateErrs = duplicateWholesaleErrors.find(r => r.itemModelIds === itemModelIds)
        if(duplicateErrs && duplicateErrs.duplicate === true) return
        addNewWholesalePrice(itemModelIds, salePrice, defaultIndex)
    }

    const isSymbolValue = (value, symbol) => {
        if (symbol === Constants.CURRENCY.VND.SYMBOL) {
            return parseInt(value)
        } else {
            return parseFloat(value).toFixed(2)
        }
    }

    return (
        <div className="container-fluid mb-4 w-100">
            <ConfirmModal ref={ ref => refConfirmModal.current = ref }/>
            {stIsSaving && <LoadingScreen zIndex={9999} loadingStyle={LoadingStyle.ELLIPSIS_GREY}/>}
            <GSContentContainer confirmWhenRedirect confirmWhen={!onRedirect && onChange}
                            className="product-form-page"
                            isSaving={isSaving}>
                {!errFetchData && (
                    <>
                        <div className='w-100 wholesale-group-header'>
                            <GSFakeLink className='mt-2'
                                onClick={() => renderBackProductDetail()}
                            >
                                &#8592; <GSTrans t="page.product.wholesalePrice.go_back_to_product_detail"/>
                            </GSFakeLink>
                            <div className='mt-2'>
                                <div className='wholesale-btn-group-header'>
                                    {!hasModel?(
                                    <GSButton secondary outline marginRight
                                            disabled={isErrors}
                                            onClick={() => addNewWholesalePrice(itemId, salePrice, stWholesalePrice.length > 0?(stWholesalePrice[0].paging.totalElements+1):1)}>
                                        {isFetchingItem?(
                                            <span className="spinner-border spinner-border-sm" role="status"  hidden={!isFetchingItem}></span>
                                        ):(
                                            <GSTrans t={"component.product.wholesalePricing.add"}/>
                                        )}

                                    </GSButton>):(
                                        <GSButton secondary outline marginRight
                                            onClick={() => addVariation()}
                                            disabled={allSelectedVariationIds.length === models.length?true:false}
                                        >
                                            {isFetchingItem?(
                                                <span className="spinner-border spinner-border-sm" role="status" hidden={!isFetchingItem}></span>
                                            ):(
                                                <GSTrans t={"component.product.addNew.variations.add"}/>
                                            )}

                                        </GSButton>
                                    )}
                                    <GSButton success
                                        disabled={!enableSaving || isErrors}
                                        onClick={() => handleOnSaveSubmit()}>
                                        <GSTrans t={"common.btn.save"}/>
                                    </GSButton>
                                </div>
                            </div>
                        </div>
                        {hasModel && (
                            <h5 className='d-flex justify-content-start font-weight-bold w-100 mt-2'>
                                <Trans i18nKey="component.wholesalePrice.title.set_up_wholesale_price">
                                    Set Up Wholesale Price
                                </Trans>
                            </h5>
                        )}
                        {isFetchingWholesale && (
                            <Loading className="mt-1"
                            style={LoadingStyle.DUAL_RING_GREY}
                            />
                        )}
                        {!isFetchingWholesale && stWholesalePrice.length < 1 && (
                            <div className='mt-3 d-flex align-items-center justify-content-center bg-white w-100' style={{minHeight: '270px'}}>
                                <p className='col text-center'>
                                    <GSTrans t={hasModel?ERROR_KEY.WARNING_ANY_CONFIG_VARIATION:ERROR_KEY.WARNING_ANY_CONFIG_WHOLESALE}/>
                                </p>
                            </div>
                        )}

                        {stWholesalePrice.length > 0 && stWholesalePrice.map((wholesale, parentInx) => {
                            const duplicateErrs = duplicateWholesaleErrors.find(r => r.itemModelIds === wholesale.itemModelIds)
                            let isExistedDuplicate = false;
                            if(duplicateErrs && duplicateErrs.duplicate === true) {
                                isExistedDuplicate = true
                            }
                            let modelName = getNameOfItemModels(models,wholesale.itemModelIds)
                            let defaultPrice = 0;
                            if(hasModel) {
                                let listIds = listSelectedVariations([wholesale.itemModelIds])
                                let getModel = models.find(r => listIds.includes(r.id))
                                defaultPrice = getModel?.newPrice
                            }else {
                                defaultPrice = salePrice
                            }
                            let totalElements = wholesale.paging.totalElements
                            return (
                                <GSWidget className={"gs-widget"} key={`item-models-wrapper-${parentInx}`}>
                                    {(hasModel)?(
                                        <div className='pt-3 pb-2 border-bottom'>
                                            <div className='wholesale-group-header ml-2'>
                                                <div className='ml-2 mt-2 font-weight-bold'>
                                                    <div>{modelName?modelName:''}</div>
                                                </div>
                                                <div className="d-flex justify-content-end mt-2 mr-2">
                                                    <GSFakeLink
                                                            className="ml-2"
                                                            onClick={() => addNewWholesaleByModel(wholesale.itemModelIds, defaultPrice, totalElements + 1)}
                                                    >
                                                        <GSTrans t={"component.product.wholesalePricing.add"}/>
                                                    </GSFakeLink>
                                                    <GSFakeLink className='ml-2' onClick={() => removeItemModel(wholesale.itemModelIds, wholesale.action)}>
                                                        <GSTrans t={"common.btn.delete"}/>
                                                    </GSFakeLink>
                                                    <GSFakeLink className='ml-2'
                                                        onClick={() => addVariation(wholesale.itemModelIds)}>
                                                        <GSTrans t={"common.btn.edit"}/>
                                                    </GSFakeLink>
                                                </div>
                                            </div>
                                            {isExistedDuplicate && (
                                                <p className='pb-0 mb-0 pt-2 text-danger pl-2' key={`duplicate-${isExistedDuplicate}`}>
                                                    <Trans i18nKey="component.wholesalePrice.error.duplicate_wholesale_price"/>
                                                </p>
                                            )}
                                        </div>
                                    ):(
                                        <div className='container-fluid w-100 border-bottom pt-3 pb-2' key={`item-models-wrapper-none-${parentInx}`}>
                                            <h5>
                                                <Trans i18nKey="component.wholesalePrice.title.set_up_wholesale_price">
                                                    Set Up Wholesale Price
                                                </Trans>
                                            </h5>
                                            {isErrors && (
                                                <p className='pb-0 mb-0 pt-2 text-danger' key={`duplicate-${isErrors}`}>
                                                    <Trans i18nKey="component.wholesalePrice.error.duplicate_wholesale_price"/>
                                                </p>
                                            )}
                                        </div>
                                    )}
                                    <GSContentBody  size={GSContentBody.size.MAX}>
                                        {/* { isFetchingMoreWholesale &&
                                        <Loading style={ LoadingStyle.DUAL_RING_GREY }/>
                                        } */}
                                        <section className='bg-light-gray-while w-100 wholesale-price-wrapper'>
                                            <AvForm autoComplete="off">
                                                    <div
                                                        className={wholesale.paging.content.length > 6 ? "gs-atm__scrollbar-1 product-form-wholesale-price-selector product-list" : "gs-atm__scrollbar-1"}
                                                    >
                                                        {wholesale.paging.content.length > 0?(
                                                            <div className="border-bottom pt-2 bg-light-gray mb-4 wholesale-grid-wrapper">
                                                                <div className="wholesale-grid-item">
                                                                    <label className="gs-frm-input__label">
                                                                        <GSTrans t={'component.product.addNew.wholesalePricing.title'}/>
                                                                    </label>
                                                                </div>
                                                                <div className="wholesale-grid-item">
                                                                    <label className="gs-frm-input__label">
                                                                        <GSTrans t={'component.product.addNew.wholesalePricing.buyFrom'}/>
                                                                    </label>
                                                                </div>
                                                                <div className="wholesale-grid-item">
                                                                    <label className="gs-frm-input__label">
                                                                        <GSTrans t={'component.product.addNew.wholesalePricing.pricePerItem'}/>
                                                                    </label>
                                                                </div>
                                                                <div className="wholesale-grid-item">
                                                                    <label className="gs-frm-input__label">
                                                                        <GSTrans t={'page.order.detail.items.discount'}/>
                                                                    </label>
                                                                </div>
                                                                <div className="wholesale-grid-item">
                                                                    <GSComponentTooltip placement={GSComponentTooltipPlacement.TOP}
                                                                                        interactive
                                                                                        className="d-inline"
                                                                                        html={
                                                                                            <GSTrans
                                                                                                t="component.wholesalePrice.configure.assign_segment_to_allow_buy_with_that_price"
                                                                                            >
                                                                                            </GSTrans>
                                                                                        }
                                                                    >
                                                                        <label className="gs-frm-input__label">
                                                                            <GSTrans t={'page.marketing.discounts.coupons.create.usageLimits.customerSegment'}/>
                                                                        </label>
                                                                    </GSComponentTooltip>
                                                                </div>
                                                            </div>
                                                        ):(
                                                            <div className='mh-25 d-flex justify-content-center align-items-center'>
                                                                <p className={!wholesale.checkEmpty?'w-100 text-center':'w-100 text-center text-danger'}>
                                                                    <GSTrans t={hasModel?ERROR_KEY.WARNING_ANY_CONFIG_VARIATION:ERROR_KEY.WARNING_ANY_CONFIG_WHOLESALE}/>
                                                                </p>
                                                            </div>
                                                        )}

                                                        {wholesale.paging.content.map((item, index) => {
                                                            let buyFromErr = ''
                                                            let priceErr = ''
                                                            let segmentErr = ''
                                                            let duplicate = ''
                                                            const getIndex = item.id? item.id: item.index
                                                            const buyFromErrs = stBuyFromErrors.find(r => r.itemModelIds === item.itemModelIds)
                                                            const priceErrors = stPricePerItemErrors.find(r => r.itemModelIds === item.itemModelIds)
                                                            const segmentErrs = stCustomerSegmentErrors.find(r => r.itemId === item.itemModelIds)
                                                            if(duplicateErrs) {
                                                                if(duplicateErrs.errors.find(r => r.minQuatity == item.minQuatity &&  r.segmentIds == item.segmentIds)) {
                                                                    duplicate = 'duplicate'
                                                                }
                                                            }
                                                            if(buyFromErrs) buyFromErr = buyFromErrs.errors[index]
                                                            if(priceErrors) priceErr = priceErrors.errors[index]
                                                            if(segmentErrs) segmentErr = segmentErrs.errors[index]

                                                            if(item.flag !== "DELETE")
                                                            return(
                                                                <div className="wholesale-grid-wrapper" key={`wholesale-row-${index}`}>
                                                                    <div className="wholesale-grid-item ml-1">
                                                                        <AvField
                                                                            key={`title-${getIndex}`}
                                                                            name={`wholesaleTitle-${getIndex}`}
                                                                            className={duplicate ? "form-control is-invalid mb-3" : 'form-control mb-3'}
                                                                            type="text"
                                                                            validate={{
                                                                                ...FormValidate.maxLength(30),
                                                                            }}
                                                                            defaultValue={item.title}
                                                                            onBlur={(e) => onChangeWholesaleTitle(e, index, item.itemModelIds, item.id, item.index)}
                                                                        />
                                                                    </div>
                                                                    <div className="wholesale-grid-item">
                                                                        <AvField
                                                                                className={(buyFromErr || duplicate) ? "is-invalid" : ''}
                                                                                name={`buyFrom-${getIndex}`}
                                                                                key={`buyFrom-${getIndex}`}
                                                                                defaultValue={item.minQuatity? item.minQuatity: 1}
                                                                                onBlur={(e) => onChangeBuyFrom(e, index, item.itemModelIds, item.id, item.index)}
                                                                                type="number"
                                                                        />
                                                                        <div className='pb-2'>
                                                                            <small className='text-danger cur-text--error' key={`buyFromErr-${item.id?item.id:item.index}`}>
                                                                                {buyFromErr}
                                                                            </small>
                                                                        </div>
                                                                    </div>
                                                                    <div className="wholesale-grid-item">
                                                                        <CryStrapInput
                                                                            ref={refProdCostPrice}
                                                                            key={`pricePerItem-${getIndex}`}
                                                                            name={`pricePerItem-${getIndex}`}
                                                                            thousandSeparator=","
                                                                            unit={stItem.currency}
                                                                            default_value={
                                                                                item.price? parseFloat(item.price) : defaultPrice
                                                                            }
                                                                            custom_err={duplicate|| priceErr}
                                                                            on_change_callback={(e) => onChangePricePerItem(e, index, item.itemModelIds, item.id, defaultPrice, item.index)}
                                                                            // required={true}
                                                                            position={CurrencyUtils.isPosition(stItem.currency)}
                                                                            precision={CurrencyUtils.isCurrencyInput(stItem.currency)? 2: 0}
                                                                            decimalScale={CurrencyUtils.isCurrencyInput(stItem.currency)? 2: 0}

                                                                        />
                                                                        <div className='pb-2'>
                                                                            <small className='text-danger'key={`priceErr-${item.id?item.id:item.index}`}>{priceErr}</small>
                                                                        </div>
                                                                    </div>
                                                                    <div className="wholesale-grid-item">
                                                                        <AvField name={`discount-${getIndex}`}
                                                                                key={`discount-${item.id?item.id:item.index}`}
                                                                                className={(stDiscountErrors[index] || duplicate) ? "is-invalid" : ''}
                                                                                readOnly
                                                                                value={discountPercentage(item.price, defaultPrice, item.itemModelIds)}
                                                                        />
                                                                    </div>
                                                                    <div className='wholesale-grid-item d-flex'>
                                                                        <div className="">
                                                                            <DropdownMultiSelect
                                                                                key={"segment-" + item.id?item.id:item.index}
                                                                                className={(segmentErr || duplicate || (item.id && !item.segmentIds)) ? "cur-input--error" : ''}
                                                                                id={item.id}
                                                                                segmentIds={item.segmentIds}
                                                                                setClosed = {isClosedSegment}
                                                                                listDataCheckbox = {stListSegment}
                                                                                listDataChecked = {item.segmentIds ? item.segmentIds : 'ALL'}
                                                                                setHiddenDropdown={isClosedDropdownSegment}
                                                                                onClose = {(e) => onChangeCustomerSegment(e, index, item.itemModelIds, item.id, item.index)}
                                                                            />
                                                                            <div className='pb-2'>
                                                                                <small className='text-danger' key={`segmentErr-${item.id?item.id:item.index}`}>{segmentErr}</small>
                                                                            </div>
                                                                        </div>
                                                                        <div className="btn-delete cursor-pointer"
                                                                            onClick={(e) => removeWholesalePriceRow(e, item.id, index, item.itemModelIds)}
                                                                        >
                                                                            <GarbageIcon />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </AvForm>
                                        </section>
                                        {props.mode === ProductFormEditorMode.EDIT && wholesale.paging.totalPages && wholesale.paging.totalPages > 1 && (
                                            <GSPagination totalItem={wholesale.paging.totalElements}
                                                currentPage={wholesale.paging.pageable.pageNumber + 1}
                                                onChangePage={(e) => onChangePage(e, wholesale.itemModelIds)}
                                                pageSize={100}
                                            />
                                        )}
                                    </GSContentBody>
                                </GSWidget>
                            );
                        }
                        )}
                    </>
                )}
            </GSContentContainer>
            {stIsShowCustomerSegmentModal && <AddVariationModal
                onClose={onCloseSelectedVariation}
                models={models}
                hasModel={hasModel}
                selectedItems={allSelectedVariationIds}
                selectedByModel={stSelectedGroupVars}
                allSelectedVarIds={allSelectedVariationIds}
                changedByModel={stSelectedGroupVars}
                currentByModel={stSelectedGroupVars}
                isEditModel={isEditByModels}
            />}
        </div>
    );
};

export default withRouter(ProductWholesalePrice);
