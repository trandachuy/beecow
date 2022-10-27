import React, { useState, useEffect, useRef } from 'react';
import LoadingScreen from "@shared/LoadingScreen/LoadingScreen";
import {LoadingStyle} from "@shared/Loading/Loading";
import GSContentContainer from "@layout/contentContainer/GSContentContainer";
import GSFakeLink from "@shared/GSFakeLink/GSFakeLink";
import GSTrans from "@shared/GSTrans/GSTrans";
import GSButton from "@shared/GSButton/GSButton";
import GSWidget from "@shared/form/GSWidget/GSWidget";
import GSContentBody from "@layout/contentBody/GSContentBody";
import { RouteUtils } from "@utils/route";
import { NAV_PATH } from "@layout/navigation/Navigation";
import {useParams, withRouter} from "react-router-dom";
import i18next from "i18next";
import {FormValidate} from "@config/form-validate";
import {AvForm, AvField} from "availity-reactstrap-validation";
import {ItemService} from "@services/ItemService";
import './ConversionUnitForm.sass'
import GSTable from "@shared/GSTable/GSTable";
import {CurrencySymbol} from "@shared/form/CryStrapInput/CryStrapInput";
import AvFieldCurrency from "@shared/AvFieldCurrency/AvFieldCurrency";
import GSImg from "@shared/GSImg/GSImg";
import {ImageUtils} from "@utils/image";
import {CurrencyUtils} from "@utils/number-format";
import DropdownSearchForm from "../../ProductFormEditor/DropdownSearchForm/DropdownSearchForm";
import {GSToast} from "@utils/gs-toast";
import ArrowReturnRight from '@components/shared/GSSvgIcon/ArrowReturnRight';
import GarbageIcon from '@shared/GSSvgIcon/Garbage';
import _ from 'lodash';
import storeService from '@services/StoreService';
import BranchListModal from '../BranchListModal/BranchListModalForm';
import { connect } from 'react-redux'
import ConfirmModal from "@shared/ConfirmModal/ConfirmModal";

export const conversionUnitMode = {
    ADD_NEW: 'ADD_NEW',
    EDIT: 'EDIT'
}

const VALIDATE_INPUT = {
    UNIT_MAX: 1000,
    NAME_MAX_CHARS: 30,
    SKU_MAX_CHARS: 100,
    BARCODE_MAX_CHARS: 48,
    MIN: 0,
    MAX_PRICE: 99999999999,
    MAX_PACKAGE: 1000000000,
    MAX_QUANTITY: 1000000,
}

const ERROR_KEY = {
    MIN_VALUE: 'common.validation.number.min.value',
    MAX_VALUE: 'common.validation.number.max.value',
    EQUAL_LOWER_COST_PRICE:"common.validation.costPrice.value",
    EQUAL_HIGHER_ORG_PRICE:"common.validation.orgPrice.value",
    RANGE_PRICE:'component.wholesalePrice.value.must.be.range',
    NONE: '',
    DUPLICATE_WHOLESALE: 'component.wholesalePrice.error.duplicate_wholesale_price',
    ERROR_DUPLICATE: 'duplicate',
    RANGE_VALUE: 'message.range.value.input'
}

const mapStateToProps = (state) => {
    return {
        collapsedMenu: state.collapsedMenu
    }
}

const ConversionUnitForm = (props) => {
    const [isSaving, setIsSaving] = useState(false)
    const [onRedirect, setOnRedirect] = useState(false)
    const [onChange, setOnChange] = useState(false)
    const [isFetchingItem, setIsFetchingItem] = useState(false);
    const [stConversionUnitList, setStConversionUnitList] = useState([])
    const [stConversionUnitItem, setStConversionUnitItem] = useState([])
    const [stItemDetail, setStItemDetail] = useState([])
    const [stConversionUnitSkuErrors, setStConversionUnitSkuErrors]= useState([])
    const [stConversionUnitBarcodeErrors, setStConversionUnitBarcodeErrors]= useState([])
    const [stConversionUnitCostPriceErrors, setStConversionUnitCostPriceErrors]= useState([])
    const [stConversionUnitOrgPriceErrors, setStConversionUnitOrgPriceErrors]= useState([])
    const [stConversionUnitNewPriceErrors, setStConversionUnitNewPriceErrors]= useState([])
    const [stDuplicateBarcode, setStDuplicateBarcode] = useState([])
    const [enableSaving, setEnableSaving] = useState(true)
    const [stConversionUnitEdit, setStConversionUnitEdit] = useState([])
    const [stBranchList, setStBranchList] = useState([])
    const [stDefaultBranch, setDefaultBranch] = useState([])
    const [isShowBranchListModal, setIsShowBranchListModal] = useState(false)
    const [stMainUnit, setStMainUnit] = useState([])
    const [checkEmptyError, setCheckEmptyError] = useState(false)
    const [stUnitSelected, setStUnitSelected] = useState([])
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

    const itemModelId = props.location.state ? props.location.state.itemModelId : null
    let { itemId } = useParams()
    let refConfirmModal = useRef()
    const getViewPortRef = useRef(null)

    useEffect(() => {
        fetchItem(itemId)
    }, [])

    const handleDimensionViewPort = () => {
        let setWidth = 0
        let getWindowWidth = document.body.offsetWidth
        let getViewPortRefWidth = getViewPortRef.current?.offsetWidth
        const matchMedia = window.matchMedia("(min-width: 992px)")
        if(matchMedia.matches){
            // default 270px left-menu
            if(props.collapsedMenu){
                setWidth = getWindowWidth - 106
            }else{
                setWidth = getWindowWidth - 316
            }
        }else{
            const mobileMedia = window.matchMedia("(max-width: 767px)")
            if(mobileMedia.matches){
                setWidth = getViewPortRefWidth - 5
            }else{
                setWidth = getViewPortRefWidth - 30
            }
        }
        setDimensions({width: setWidth})
    }

    useEffect(() => {
        handleDimensionViewPort()
        window.addEventListener("resize", handleDimensionViewPort)
        return () => window.removeEventListener("resize", handleDimensionViewPort)
    }, []);

    useEffect(() => {
        handleDimensionViewPort()
    },[props.collapsedMenu])

    useEffect(() => {
        if(props.conversionUnitList && props.conversionUnitList.length > 0){
            let list = []
            let unitSelected = []
            let data = props.conversionUnitList
            for (const [index, item] of data.entries()) {
                list.push({
                    index: index,
                    id: item.id,
                    conversionUnitId: item.conversionUnitId,
                    conversionUnitName: item.conversionUnitName || '',
                    quantity: item.quantity
                })
                unitSelected.push(item.conversionUnitId)
            }
            setStConversionUnitList(list)
            setStConversionUnitItem(data)
        }
    }, [])

    useEffect(() => {
        if(stConversionUnitItem.length > 0){
            let unitSelected = []
            for (const item of stConversionUnitItem) {
                if(!item.conversionUnitId) return
                unitSelected.push(item.conversionUnitId)
            }
            setStUnitSelected(unitSelected)
        }
    }, [stConversionUnitItem])

    const fetchItem =(itemId) => {
        setIsFetchingItem(true)
        ItemService.fetch(itemId)
        .then(result => {
            setIsFetchingItem(false)
            if(!result) return
            let data = {
                conversionUnitId: result.conversionUnitId,
                conversionUnitName: result.conversionUnitName
            }
            setStMainUnit(data)
            setStItemDetail(result)
            fetchBranchList(result?.branches)
        })
        .catch((err)=>{
            console.log(err)
        })
    }

    const fetchBranchList = (branchesItem) => {
        storeService.getFullStoreBranches()
            .then(result => {
                if(!result) return
                let branchList = []
                for (const item of result.data){
                    let getItem = branchesItem.find(r => r.branchId === item.id)
                    if(getItem){
                        branchList.push({
                            id: getItem.branchId,
                            sku: getItem.sku,
                            name: item.name,
                            isDefault: item.isDefault
                        })
                    }
                }
                setStBranchList(branchList)
                let defaultBranch = branchList.find(r => r.isDefault === true)
                if(!defaultBranch) return
                setDefaultBranch(defaultBranch)
                // CredentialUtils.setStoreDefaultBranch(defaultBranch.id)
            })
            .catch(err => {
                console.log(err)
            })
    }

    const renderBackProductDetail = (e) => {
        RouteUtils.redirectWithoutReload(props, NAV_PATH.productEdit + `/${itemId}`)
    }

    const renderBackUnitVariation = () => {
        setOnChange(false)
        setOnRedirect(true)
        let filterModel = handleModelWithoutDeposit(stItemDetail.models)

        RouteUtils.redirectWithoutReloadWithData(props, NAV_PATH.productConversionUnitVariationEdit + '/' + itemId, {
            listModelItemId: filterModel
        });
    }

    const checkMinMaxInputPrice = (price) => {
        let error = ''
        const parsedPrice = parseFloat(price)
        if (parsedPrice > VALIDATE_INPUT.MAX_PRICE) {
            error = i18next.t(ERROR_KEY.RANGE_PRICE, {x: CurrencyUtils.formatThousand(VALIDATE_INPUT.MIN), y:CurrencyUtils.formatThousand(VALIDATE_INPUT.MAX_PRICE)})
        }
        return error
    }

    const validateUnitSKU = (value, index) => {
        let error = '';
        if(value && value.length > VALIDATE_INPUT.MAX_CHAR){
            error = i18next.t('common.validation.char.max.length', {x: VALIDATE_INPUT.SKU_MAX_CHARS})
        }
        setStConversionUnitSkuErrors(errors => {
            errors[index] = error
            return [...errors]
        })
        return error
    }

    const onChangeUnitSKU = (e, index, conversionUnitId, itemCloneId) => {
        const {value, name } =  e.currentTarget;
        let unitItem = _.cloneDeep(stConversionUnitItem)
        unitItem[index].sku = value
        validateUnitSKU(value, index)
        setStConversionUnitItem(unitItem)
        setOnChange(true)
        onChangeConversionUnitEdit('sku', value, unitItem[index], itemCloneId)
    }

    const validateUnitBarcode = (value, index) => {
        let error = '';
        if(value && value.length > VALIDATE_INPUT.BARCODE_MAX_CHARS){
            error = i18next.t('common.validation.char.max.length', {x: VALIDATE_INPUT.BARCODE_MAX_CHARS})
        }
        setStConversionUnitBarcodeErrors(errors => {
            errors[index] = error
            // errors.index = index
            // errors.error = error
            return [...errors]
        })
        return error
    }

    const checkDuplicateBarcode = (conversionUnitItem) => {
        let data = []
        const duplicateErrors = []
        conversionUnitItem.map((item, index)=> {
            //for each item in arrayOfObjects check if the object exists in the resulting array
            let error = ''
            if(data.find((object, idx) => {

                if(item.barcode && item.barcode !== '' && object.barcode === item.barcode ) {
                    //if the object exists iterate times
                    object.times++;
                    error = i18next.t('page.productDetail.message.duplicate.barcode')
                    return true;
                    //if it does not return false
                } else return false;
            })){
            } else {
                //if the object does not exists push it to the resulting array and set the times count to 1
                item.times = 1;
                error = ''
                data.push({barcode: item.barcode, times: item.times});
            }
            duplicateErrors[index] = error
            return data
        })
        let duplicateItem = data.filter(r => r.times > 1)
        setStDuplicateBarcode(duplicateItem)
        if(duplicateItem.length > 0)
        return true
    }

    const onChangeConversionUnitEdit = (key, value, unitItem, itemCloneId) => {
        if(props.mode !== conversionUnitMode.EDIT) return
        // unitItem.action = conversionUnitMode.EDIT
        setStConversionUnitEdit(list => {
            let row = list.find(r => r.itemCloneId === itemCloneId)
            if(row){
                list.forEach(ls => {
                    if(ls.itemCloneId === itemCloneId){
                        ls[key] = value
                    }
                })
            }else{
                list.push(unitItem)
            }
            return [...list]
        })
    }

    const onChangeUnitBarcode = (e, index, conversionUnitId, itemCloneId) => {
        const {value, name } =  e.currentTarget;
        let unitItem = _.cloneDeep(stConversionUnitItem)
        unitItem[index].barcode = value
        validateUnitBarcode(value, index)
        setStConversionUnitItem(unitItem)
        checkDuplicateBarcode(unitItem)
        setOnChange(true)
        onChangeConversionUnitEdit('barcode',value, unitItem[index], itemCloneId)
    }

    const validateCostPrice = (costPrice, index) => {
        let error = ''
        const newPrice = stConversionUnitItem[index].newPrice
        const parsedPrice = parseFloat(costPrice)
        if (parsedPrice > VALIDATE_INPUT.MAX_PRICE) {
            error = i18next.t(ERROR_KEY.MAX_VALUE, {x: CurrencyUtils.formatThousand(VALIDATE_INPUT.MAX_PRICE)})
        }else {
            if (parseFloat(costPrice) > parseFloat(newPrice)){
                error = i18next.t(ERROR_KEY.EQUAL_LOWER_COST_PRICE, {x: CurrencyUtils.formatThousand(newPrice)})
            }
        }
        setStConversionUnitCostPriceErrors(errors => {
            errors[index] = error
            return [...errors]
        })
        return error
    }

    const onChangeUnitCostPrice = (e, index, conversionUnitId, itemCloneId) => {
        const {value, name } =  e.currentTarget;
        let costPrice = value
        if(!costPrice || parseFloat(costPrice) < 0){
            costPrice = 0
        }
        let unitItem = _.cloneDeep(stConversionUnitItem)
        unitItem[index].costPrice = formatCurrency(costPrice)
        setStConversionUnitItem(unitItem)
        validateCostPrice(costPrice, index)
        setOnChange(true)
        onChangeConversionUnitEdit('costPrice', value, unitItem[index], itemCloneId)

    }

    const onChangeUnitOrgPrice = (e, index, conversionUnitId, itemCloneId) => {
        const {value, name } =  e.currentTarget;
        let orgPrice = value
        const clonedUnit = _.cloneDeep(stConversionUnitItem)
        let unitItem = clonedUnit[index]
        let error = checkMinMaxInputPrice(orgPrice)
        let compareNewPriceErr = ''
        if(!orgPrice || parseFloat(orgPrice) < VALIDATE_INPUT.MIN){
            orgPrice = 0
        }
        if(parseFloat(orgPrice) < unitItem.newPrice){
            compareNewPriceErr = i18next.t(ERROR_KEY.MAX_VALUE, {x: CurrencyUtils.formatThousand(orgPrice)})

        }
        setStConversionUnitOrgPriceErrors(errors => {
            errors[index] = error

            return [...errors]
        })
        setStConversionUnitNewPriceErrors(errors => {
            errors[index] = compareNewPriceErr

            return [...errors]
        })
        unitItem.orgPrice = formatCurrency(orgPrice)
        setStConversionUnitItem(clonedUnit)
        setOnChange(true)
        onChangeConversionUnitEdit('orgPrice', orgPrice, unitItem, itemCloneId)
    }

    const checkValidateNewPrice = (orgPrice, costPrice, newPrice) => {
        let error = '';
        if (parseFloat(newPrice) > parseFloat(orgPrice)) {
            error = i18next.t(ERROR_KEY.MAX_VALUE, {x: CurrencyUtils.formatThousand(orgPrice)})
        }
        else if (parseFloat(newPrice) < parseFloat(costPrice)) {
            error = i18next.t(ERROR_KEY.MIN_VALUE, {x: CurrencyUtils.formatThousand(costPrice)})
        }
        else {
            error = checkMinMaxInputPrice(newPrice)
        }
        return error;
    }

    const  validateUnitNewPrice = (orgPrice, costPrice, newPrice, index) => {
        let error = checkValidateNewPrice(orgPrice, costPrice, newPrice);
        setStConversionUnitNewPriceErrors(errors => {
            errors[index] = error
            return [...errors]
        })
    }

    const formatCurrency = (input) => {
        return input.toString().replace(/[,]/g, '');
    }

    const onChangeUnitNewPrice = (e, index, conversionUnitId, itemCloneId) => {
        const clonedUnit = _.cloneDeep(stConversionUnitItem)
        let unitItem = clonedUnit[index]
        const { value, name } =  e.currentTarget;
        let newPrice = value
        if(!newPrice || parseFloat(newPrice) < 0){
            newPrice = 0
        }
        unitItem.newPrice = formatCurrency(newPrice)
        setStConversionUnitItem(clonedUnit)
        validateUnitNewPrice(unitItem.orgPrice, unitItem.costPrice, newPrice, index)
        setOnChange(true)
        onChangeConversionUnitEdit('newPrice', newPrice, unitItem, itemCloneId)
    }

    const onChangeValueByKey = (key, value, index, itemCloneId) => {
        const clonedUnit = _.cloneDeep(stConversionUnitItem)
        let unitItem = clonedUnit[index]
        unitItem[key] = value
        setStConversionUnitItem(clonedUnit)
        setOnChange(true)
        onChangeConversionUnitEdit(key, value, unitItem, itemCloneId)
    }

    const onChangeUnitWeight = (e, index, itemCloneId) => {
        const { value, name } =  e.currentTarget
        onChangeValueByKey('weight', parseInt(value), index, itemCloneId)
    }

    const onChangeUnitLength = (e, index, itemCloneId) => {
        const { value, name } =  e.currentTarget
        onChangeValueByKey('length', parseInt(value), index, itemCloneId)
    }

    const onChangeUnitWidth = (e, index, itemCloneId) => {
        const { value, name } =  e.currentTarget
        onChangeValueByKey('width', parseInt(value), index, itemCloneId)
    }

    const onChangeUnitHeight = (e, index, itemCloneId) => {
        const { value, name } =  e.currentTarget
        onChangeValueByKey('height', parseInt(value), index, itemCloneId)
    }

    const addNewUnitRow = () => {
        setCheckEmptyError(false)
        setEnableSaving(true)
        const newIndex = Date.now()
        let data = {
            id: newIndex,
            index: stConversionUnitList.length + 1,
            quantity: 1,
            conversionUnitName: '',
            conversionUnitId: null,
            variationName: stMainUnit.conversionUnitName,
            action: conversionUnitMode.ADD_NEW
        }
        setStConversionUnitList(list => [data, ...list])
        addNewConversionUnitItem(data)
        setOnChange(true)
    }

    const addNewConversionUnitItem = (unitData) => {
        const newIndex = Date.now()
        let data = {
            itemCloneId: newIndex,
            id: unitData.id,
            quantity: unitData.quantity,
            conversionUnitName: unitData.conversionUnitName,
            conversionUnitId: unitData.conversionUnitId,
            modelId: itemModelId ? itemModelId.modelId : null,
            sku: itemModelId ? itemModelId.sku : stItemDetail.sku,
            barcode: '',
            orgPrice: itemModelId ? itemModelId.orgPrice * unitData.quantity : stItemDetail.orgPrice * unitData.quantity,
            costPrice: itemModelId ? itemModelId.costPrice * unitData.quantity : stItemDetail.costPrice * unitData.quantity,
            newPrice: itemModelId ? itemModelId.newPrice * unitData.quantity :stItemDetail.newPrice * unitData.quantity,
            stock: itemModelId ? Math.floor((itemModelId.totalItem/unitData.quantity) * 100) / 100 : Math.floor((stItemDetail.totalItem/unitData.quantity) * 100) / 100,
            weight: stItemDetail.shippingInfo?.weight*unitData.quantity,
            width: stItemDetail.shippingInfo?.width,
            height: stItemDetail.shippingInfo?.height,
            length: stItemDetail.shippingInfo?.length,
            action: conversionUnitMode.ADD_NEW,
            index: stConversionUnitItem.length + 1,

        }
        setStConversionUnitItem(list => [data, ...list])
        onChangeConversionUnitEdit('', '', data, newIndex)
    }

    const removeUnitRow = (id) => {
        let clonedUnit = _.cloneDeep(stConversionUnitList)
        let clonedItem = _.cloneDeep(stConversionUnitItem)
        let getItem = clonedItem.find(r=> r.id === id)
        let excludedUnit = clonedUnit.filter(r=> r.id !== id)
        let unitItem = clonedItem.filter(r => r.id !== id)

        setStConversionUnitList(excludedUnit)
        setStConversionUnitItem(unitItem)
        setOnChange(true)
        if(props.mode !== conversionUnitMode.EDIT) return
        if(getItem.action) return
        getItem.action = 'delete'
        setStConversionUnitEdit(list => [...list, getItem])
    }

    const handleChangeQuantityUnitRow = (unit, index, parentId) => {
        let { value, name }  = unit.currentTarget
        let quantity = value
        if(!parseInt(quantity) || parseInt(quantity) <= 0 ) {
            setEnableSaving(false)
            return
        }
        setStConversionUnitList(list => {
            let unit = list.find(r => r.id === parentId)
            if(unit){
                unit.quantity =  parseInt(quantity)
            }

            return [...list]
        })
        onChangeUnitItemRow(parseInt(quantity), parentId, index)
        setEnableSaving(true)
        setOnChange(true)
    }

    const handleChangeUnitNameRow = (unit, index, unitId) => {
        if(!unit) return
        // let {value, name} = e.currentTarget
        let { id, name }  = unit
        setStConversionUnitList(list => {
            let unit = list.find(r => r.id === unitId)
            if(unit){
                unit.conversionUnitId = id
                unit.conversionUnitName = name
                unit.emptyUnit = false
            }

            return [...list]
        })
        setStConversionUnitItem(unitItem => {
            let unit = unitItem.find(r => r.id === unitId)
            if(unit){
                unit.conversionUnitId = id
                unit.conversionUnitName = name
            }

            return [...unitItem]
        })
        setOnChange(true)
        if(props.mode !== conversionUnitMode.EDIT) return
        let clonedData = _.cloneDeep(stConversionUnitItem)
        let getItem = clonedData.find(r => r.id === unitId)
        if(getItem){
            getItem.conversionUnitId = id
            getItem.conversionUnitName = name
        }
        setStConversionUnitEdit(list => {
            let row = list.find(r => r.id === unitId)
            if(row){
                row.conversionUnitId = id
                row.conversionUnitName = name

            }else{
                list.push(getItem)
            }
            return [...list]
        })
    }

    const checkValidatePriceByRowUnit = (unitItem, index) => {
        // let getIndex = unitItem.index - 1
        let checkOrgPrice =  checkMinMaxInputPrice(unitItem.orgPrice)
        let checkNewPrice = checkMinMaxInputPrice(unitItem.newPrice)
        let checkCostPrice = checkMinMaxInputPrice(unitItem.costPrice)
        setStConversionUnitOrgPriceErrors(errors => {
            errors[index] = checkOrgPrice

            return [...errors]
        })
        setStConversionUnitNewPriceErrors(errors => {
            errors[index] = checkNewPrice

            return [...errors]
        })
        setStConversionUnitNewPriceErrors(errors => {
            errors[index] = checkCostPrice

            return [...errors]
        })
    }

    const onChangeUnitItemRow = (quantity, parentId, index) => {
        const clonedUnit = _.cloneDeep(stConversionUnitItem)
        let unitItem = clonedUnit.find(r => r.id === parentId)
        if(!unitItem) return
        unitItem.quantity = quantity
        unitItem.costPrice = stItemDetail.costPrice*quantity
        unitItem.newPrice = stItemDetail.newPrice*quantity
        unitItem.orgPrice = stItemDetail.orgPrice*quantity
        unitItem.stock = Math.floor((stItemDetail.totalItem/quantity) * 100) / 100
        unitItem.weight = stItemDetail.shippingInfo?.weight*quantity

        setStConversionUnitItem(list => {
            let item = list.find(r => r.id === parentId)
            if(item){
                item.quantity = quantity
                item.costPrice = stItemDetail.costPrice*quantity
                item.newPrice = stItemDetail.newPrice*quantity
                item.orgPrice = stItemDetail.orgPrice*quantity
                item.stock = Math.floor((stItemDetail.totalItem/quantity) * 100) / 100
                item.weight = stItemDetail.shippingInfo?.weight*quantity
            }
            return [...list]
        })
        checkValidatePriceByRowUnit(unitItem, index)
        if(props.mode !== conversionUnitMode.EDIT) return
        setStConversionUnitEdit(list => {
            let row = list.find(r => r.id === parentId)
            if(row){
                row.quantity = quantity
                row.costPrice = stItemDetail.costPrice*quantity
                row.newPrice = stItemDetail.newPrice*quantity
                row.orgPrice = stItemDetail.orgPrice*quantity
                row.stock = Math.floor((stItemDetail.totalItem/quantity) * 100) / 100
                row.weight = stItemDetail.shippingInfo?.weight*quantity
            }else{
                list.push(unitItem)
            }
            return [...list]
        })
    }

    const checkEmptyUnitByRow = (data) => {
        setStConversionUnitList(prev => {
            let list = prev.filter(r => r.conversionUnitId == null)
            for (const item of list){
                item.emptyUnit = true
            }
            return[...prev]
        })
        let checkEmpty = false
        for (const item of data){
            if(!item.conversionUnitId){
                checkEmpty = true
            }
        }
        return checkEmpty
    }
    const checkAllErrors = (array) =>{
        return array.some( item => (item !== '' && item !== undefined) )
    }

    const handleModelWithoutDeposit = (models) => {
        if(!models.find(model => model.label.includes("[d3p0s1t]"))) return models
        const excludedDeposit = models.filter(model => model.name.includes("[100P3rc3nt]"));
        return excludedDeposit
    }

    const handleOnSubmit = () => {
        if(checkDuplicateBarcode(stConversionUnitItem)) return
        if(checkAllErrors(stConversionUnitNewPriceErrors) || checkAllErrors(stConversionUnitOrgPriceErrors) || checkAllErrors(stConversionUnitCostPriceErrors)) return

        let request = {
            itemId: itemId,
            hasModel: stConversionUnitItem[0]?.modelId || stConversionUnitEdit[0]?.modelId ? true : false,
            lstConversionUnitItemDto: []
        }
        let dataList = []
        let handleData = []
        if(props.mode === conversionUnitMode.ADD_NEW){
            handleData = stConversionUnitItem
        }else{
            handleData = stConversionUnitEdit
        }
        for (const item of handleData) {
            let data = {
                id: (item.action && item.action === conversionUnitMode.ADD_NEW) ? '' : item.id,
                itemCloneId: (item.action && item.action === conversionUnitMode.ADD_NEW) ? '' : item.itemCloneId,
                action: (item.action && item.action === 'delete') ? item.action : '',
                conversionUnitId: item.conversionUnitId,
                quantity: item.quantity,
                itemId: itemId,
                modelId: item.modelId,
                sku: item.sku,
                barcode: item.barcode,
                costPrice: item.costPrice,
                orgPrice: item.orgPrice,
                newPrice: item.newPrice,
                weight: item.weight,
                width: item.width,
                height: item.height,
                length: item.length,
            }
            dataList.push(data)
        }
        request.lstConversionUnitItemDto = dataList
        if(dataList.length === 0) {
            setCheckEmptyError(true)
            setEnableSaving(false)
            return
        }
        if(checkEmptyUnitByRow(dataList)) return
        setEnableSaving(false)
        setIsSaving(true)

        ItemService.editConversionUnitItem(request)
        .then((result)=> {
            if(result.status === 1){
                GSToast.commonUpdate()
                setOnChange(false)
                setOnRedirect(true)
                if (stConversionUnitItem[0]?.modelId || stConversionUnitEdit[0]?.modelId) {
                    let filterModel = handleModelWithoutDeposit(stItemDetail.models)

                    RouteUtils.redirectWithoutReloadWithData(props, NAV_PATH.productConversionUnitVariationEdit + '/' + itemId, {
                        listModelItemId: filterModel
                    });
                } else {
                    RouteUtils.redirectWithoutReload(props, NAV_PATH.productEdit + '/' + itemId)
                }
            }else{
                GSToast.commonError()
            }
        })
        .catch(err => {
            GSToast.commonError()
            console.log(err)
        })
        .finally(()=> {
            setIsSaving(false)
            setEnableSaving(true)
        })
    }

    const onCloseBranchListModal = () => {
        setIsShowBranchListModal(state => !state)
    }

    const renderBackTo = () => {
        if (itemModelId || stConversionUnitItem[0]?.modelId || stConversionUnitEdit[0]?.modelId) {
            return(
                <GSFakeLink className='ml-2' onClick={()=> renderBackUnitVariation()}>
                    &#8592; <GSTrans t="page.product.wholesalePrice.go_back_to_unit_variation"/>
                </GSFakeLink>
            )
        } else {
            return(
                <GSFakeLink className='ml-2' onClick={()=> renderBackProductDetail()}>
                    &#8592; <GSTrans t="page.product.wholesalePrice.go_back_to_product_detail"/>
                </GSFakeLink>
            )
        }
    }

    return (
        <>
            <ConfirmModal ref={ ref => refConfirmModal.current = ref }/>
            <div className="mb-4 w-100 conversion-unit-wrapper" ref={getViewPortRef}>
                {isSaving || isFetchingItem && <LoadingScreen zIndex={9999} loadingStyle={LoadingStyle.ELLIPSIS_GREY}/>}
                <GSContentContainer confirmWhenRedirect
                    confirmWhen={!onRedirect && onChange}
                    className="product-form-page"
                    minWidthFitContent
                    isSaving={isSaving}
                >
                    <div className='row w-100'>
                        <div className='col-lg-7 col-md-7 col-sm-12 col-12 text-left pl-0 mt-2'>{renderBackTo()}</div>
                        <div className='col-lg-5 col-md-5 col-sm-12 col-9 btn-header-wrapper mt-2'>
                            <GSButton success outline marginRight onClick={() => addNewUnitRow()}>
                                <GSTrans t={"page.conversionUnit.btn.select.unit"}/>
                            </GSButton>
                            <GSButton
                                secondary outline marginRight
                                onClick={() => renderBackProductDetail()}
                            >
                                <GSTrans t={"common.btn.cancel"}/>
                            </GSButton>
                            <GSButton success disabled={!enableSaving} onClick={() => handleOnSubmit()}>
                                <GSTrans t={"common.btn.save"}/>
                            </GSButton>
                        </div>
                    </div>
                    {
                        itemModelId ? (
                        <h5 className='d-flex justify-content-start font-weight-bold w-100 mt-2'>
                            {i18next.t('page.productDetail.set.up.conversion.unit.variation',{variation: itemModelId.name})}
                        </h5>) : (
                            <GSWidget className={"gs-widget border-none"}>
                                <div className='container-fluid w-100 pt-3 pb-2'>
                                    <h6><GSTrans t={"page.productDetail.set.up.conversion.unit"}/></h6>
                                </div>
                            </GSWidget>
                        )
                    }

                    <GSContentBody size={GSContentBody.size.MAX}>
                        <AvForm autoComplete="off" className="conversion-unit-form">
                            {stConversionUnitList.length > 0 ? (
                                <section className='w-100 border bg-white'>
                                    <div className="row d-md-flex border-bottom pt-2 bg-light-white mb-4 w-100">
                                        <div className="col-5">
                                            <label className="gs-frm-input__label">
                                                <GSTrans t={'page.productDetail.text.unit'}/>
                                            </label>
                                        </div>
                                        <div className="col-7 p-0">
                                            <label className="gs-frm-input__label">
                                                <GSTrans t={'page.dashboard.table.quantity'}/>
                                            </label>
                                        </div>
                                    </div>
                                    <div className="gs-atm__scrollbar-1 w-100 conversion-unit-list">
                                        {stConversionUnitList.map((unit, indx) => {
                                            return (
                                                <div className={indx === 0 ? "w-100 pt-2" : "w-100"} key={unit.id}>
                                                    <div className="row" id={`unit-row-${indx}`}>
                                                        <div className="col-lg-5 col-md-5 col-sm-6 col-5 pr-0">
                                                            <DropdownSearchForm
                                                                key={`unitName-${unit.id}`}
                                                                name={`unit-${indx}`}
                                                                parentClass={"w-100"}
                                                                className={unit.emptyUnit ? "form-control mb-0 w-100 is-invalid " : "form-control mb-0 w-100"}
                                                                placeholderSearch={ i18next.t(`component.product.addNew.unit.search`)}
                                                                conversionUnitId={unit.conversionUnitId}
                                                                conversionUnitName={unit.conversionUnitName}
                                                                onChange={(e)=> handleChangeUnitNameRow(e, indx, unit.id )}
                                                                tabIndex={`indx-${indx}`}
                                                                unitSelected={stUnitSelected}
                                                                mainUnit={stMainUnit.conversionUnitId}
                                                            />
                                                        </div>
                                                        <div className="col-lg-3 col-md-3 col-sm-4 col-3 p-0 pr-1">
                                                            <AvField
                                                                label=""
                                                                key={unit.id? unit.id : indx}
                                                                name={`quantity-${indx}`}
                                                                className="form-control mb-3"
                                                                type="number"
                                                                value={unit.quantity? unit.quantity : 1}
                                                                min={1}
                                                                validate={{
                                                                    ...FormValidate.required(),
                                                                    ...FormValidate.minValue(1, true, ERROR_KEY.MIN_VALUE),
                                                                    ...FormValidate.maxValue(VALIDATE_INPUT.MAX_QUANTITY, true, ERROR_KEY.MAX_VALUE)
                                                                }}
                                                                tabIndex={2}
                                                                onChange={(e)=> handleChangeQuantityUnitRow(e, indx, unit.id )}
                                                            />
                                                        </div>
                                                        <div className="col-lg-2 col-md-2 col-sm-1 col-3 pl-2 pr-0 ">
                                                            <div className='mt-2 line-clamp-1 main-unit'>
                                                                {stMainUnit.conversionUnitName}
                                                            </div>
                                                        </div>
                                                        <div className="col-lg-2 col-md-2 col-sm-1 col-1 pl-1 pr-2">
                                                            <div className="btn-delete mt-2"
                                                                onClick={()=> removeUnitRow(unit.id)}
                                                                style={{ color: '#9ea0a5', margin:'.5rem auto', cursor:'pointer'}}
                                                            >
                                                                <GarbageIcon/>
                                                            </div>
                                                        </div>

                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </section>
                            ):(
                                <div className='bg-white w-100 vh-55 d-flex justify-content-center align-items-center'>
                                    <p className={checkEmptyError ? 'text-danger' : ''}>
                                        <GSTrans t={"page.productDetail.text.dont.add.any.conversion.unit"}/>
                                    </p>
                                </div>
                            )}
                            <section
                                className='w-100 border-left border-right border-bottom mt-2 unit-conversion-item-wrapper gs-atm__scrollbar-1'
                                style={{maxWidth: `${dimensions.width}px`}}
                            >
                                <GSTable className="table-conversion-list table table-responsive gs-atm__scrollbar-1">
                                    <thead>
                                        <tr>
                                            <th><GSTrans t={'page.conversionUnit.table.title.conversion.unit'}/></th>
                                            <th><GSTrans t={'productList.tbheader.productSKU'}/></th>
                                            <th><GSTrans t={'page.customers.edit.barCode'}/></th>
                                            <th><GSTrans t={'page.discount.create.select_product.cost_price'}/></th>
                                            <th><GSTrans t={'page.discount.create.select_product.listing_price'}/></th>
                                            <th><GSTrans t={'page.discount.create.select_product.selling_price'}/></th>
                                            <th><GSTrans t={'page.order.create.complete.quantityModal.table.stock'}/></th>
                                            <th><GSTrans t={'component.product.addNew.shipping.weight'}/></th>
                                            <th><GSTrans t={'component.product.addNew.shipping.length'}/></th>
                                            <th><GSTrans t={'component.product.addNew.shipping.width'}/></th>
                                            <th><GSTrans t={'component.product.addNew.shipping.height'}/></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr className='main-product'>
                                            <td>
                                                <div className='row'>
                                                    <div className='col-3 pl-0 pr-0'>
                                                        <GSImg src={ImageUtils.getImageFromImageModel(stItemDetail?.images?.[0], 35)} alt="" />
                                                    </div>
                                                    <div className='col-9 pl-2 pr-0 line-clamp-2'>{stItemDetail.name}</div>
                                                </div>
                                            </td>
                                            <td>
                                                <AvField
                                                    onClick={() => {setIsShowBranchListModal(true)}}
                                                    className="cursor--pointer input-min-width text-primary"
                                                    name={`sku-${stItemDetail.id}`}
                                                    value={stDefaultBranch.sku}
                                                    unit={CurrencySymbol.NONE}
                                                    // style={{fontFamily: 'monospace'}}
                                                    disabled
                                                />
                                            </td>
                                            <td>
                                                <AvField
                                                    className="input-min-width"
                                                    name={`barcode-${stItemDetail.id}`}
                                                    value={stItemDetail.barcode}
                                                    unit={CurrencySymbol.NONE}
                                                    // style={{fontFamily: 'monospace'}}
                                                    disabled
                                                />
                                            </td>
                                            <td>
                                                <AvFieldCurrency
                                                    className="input-min-width"
                                                    name={"costPrice-" + stItemDetail.id}
                                                    value={stItemDetail.costPrice}
                                                    unit={stItemDetail.currency}
                                                    disabled
                                                    position={CurrencyUtils.isPosition(stItemDetail.currency)}
                                                    precision={CurrencyUtils.isCurrencyInput(stItemDetail.currency) && '2'}
                                                    decimalScale={CurrencyUtils.isCurrencyInput(stItemDetail.currency) && 2}
                                                />
                                            </td>
                                            <td>
                                                <AvFieldCurrency
                                                    className="input-min-width"
                                                    name={"orgPrice-" + stItemDetail.id}
                                                    value={stItemDetail.orgPrice}
                                                    unit={stItemDetail.currency}
                                                    disabled
                                                    position={CurrencyUtils.isPosition(stItemDetail.currency)}
                                                    precision={CurrencyUtils.isCurrencyInput(stItemDetail.currency) && '2'}
                                                    decimalScale={CurrencyUtils.isCurrencyInput(stItemDetail.currency) && 2}
                                                />
                                            </td>
                                            <td>
                                                <AvFieldCurrency
                                                    className="input-min-width"
                                                    name={"newPrice-" + stItemDetail.id}
                                                    value={stItemDetail.newPrice}
                                                    unit={stItemDetail.currency}
                                                    disabled
                                                    position={CurrencyUtils.isPosition(stItemDetail.currency)}
                                                    precision={CurrencyUtils.isCurrencyInput(stItemDetail.currency) && '2'}
                                                    decimalScale={CurrencyUtils.isCurrencyInput(stItemDetail.currency) && 2}
                                                />
                                            </td>
                                            <td>
                                                <AvField className="input-min-width"
                                                    name={`stock-${stItemDetail.id}`}
                                                    value={itemModelId ? itemModelId.totalItem : stItemDetail.totalItem}
                                                    unit={CurrencySymbol.NONE}
                                                    // style={{fontFamily: 'monospace'}}
                                                    disabled
                                                />
                                            </td>
                                            <td>
                                                <AvFieldCurrency
                                                    name={'productWeight'}
                                                    unit={CurrencySymbol.G}
                                                    value={stItemDetail.shippingInfo?.weight}
                                                    disabled
                                                />
                                            </td>
                                            <td>
                                                <AvFieldCurrency
                                                    name={'productLength'}
                                                    unit={CurrencySymbol.CM}
                                                    value={stItemDetail.shippingInfo?.length}
                                                    disabled
                                                />
                                            </td>
                                            <td>
                                                <AvFieldCurrency
                                                    name={'productWidth'}
                                                    unit={CurrencySymbol.CM}
                                                    value={stItemDetail.shippingInfo?.width}
                                                    disabled

                                                />
                                            </td>
                                            <td>
                                                <AvFieldCurrency
                                                    name={'productHeight'}
                                                    unit={CurrencySymbol.CM}
                                                    value={stItemDetail.shippingInfo?.height}
                                                    disabled
                                                />
                                            </td>
                                        </tr>
                                        {stConversionUnitItem.map((item, index) => {
                                            let duplicate = ''
                                            let checkDuplicate = stDuplicateBarcode.find(r => r.barcode === item.barcode)
                                            if(checkDuplicate && checkDuplicate.times > 1) duplicate = i18next.t('page.productDetail.message.duplicate.barcode')
                                            return (
                                                <tr className='conversion-unit' key={item.id}>
                                                    <td>
                                                        <div className='row'>
                                                            <div className='col-4 pl-0 pr-0'>
                                                                <div className='d-flex justify-content-end align-items-center'>
                                                                    <div className='pr-1'><ArrowReturnRight/></div>
                                                                    <GSImg src="assets/images/default_image2.png" width={35} height={35} alt="" />
                                                                </div>
                                                            </div>
                                                            <div className='col-8 pl-2 pr-0 line-clamp-2'>{item.conversionUnitName}</div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div>
                                                            <AvField className="input-min-width"
                                                                key={`unitSku-${index}`}
                                                                name={`unitSku-${item.itemCloneId}`}
                                                                value={item.sku ? item.sku : stDefaultBranch.sku}
                                                                unit={CurrencySymbol.NONE}
                                                                onBlur={(e) => onChangeUnitSKU(e, index, item.conversionUnitId, item.itemCloneId)}
                                                                validate={{
                                                                    ...FormValidate.maxLength(100),
                                                                }}
                                                                // style={{fontFamily: 'monospace'}}
                                                                // readOnly
                                                            />
                                                            <small className='text-danger' key={stConversionUnitSkuErrors[index]}>
                                                                {stConversionUnitSkuErrors[index]}
                                                            </small>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div>
                                                            <AvField
                                                                key={`unitBarcode-${index}`}
                                                                name={`unitBarcode-${item.itemCloneId}`}
                                                                value={item.barcode}
                                                                unit={CurrencySymbol.NONE}
                                                                onBlur={(e) => onChangeUnitBarcode(e, index, item.conversionUnitId, item.itemCloneId)}
                                                                className={(stConversionUnitBarcodeErrors[index] || duplicate) ? "form-control is-invalid input-min-width mb-0" : 'form-control input-min-width mb-0'}
                                                                validate={{
                                                                    ...FormValidate.maxLength(48),
                                                                }}
                                                            />
                                                            <small className='text-danger' key={`errUnitBarcode-${index}`}>
                                                                {duplicate || stConversionUnitBarcodeErrors[index]}
                                                            </small>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div>
                                                            <AvFieldCurrency
                                                                className={stConversionUnitCostPriceErrors[index]?"input-min-width is-invalid":"input-min-width"}
                                                                key={`unitCostPrice-${index}`}
                                                                name={"unitCostPrice-" + item.itemCloneId}
                                                                value={item.costPrice}
                                                                unit={stItemDetail.currency}
                                                                onBlur={(e) => onChangeUnitCostPrice(e, index, item.conversionUnitId, item.itemCloneId)}
                                                                position={CurrencyUtils.isPosition(stItemDetail.currency)}
                                                                precision={CurrencyUtils.isCurrencyInput(stItemDetail.currency) && '2'}
                                                                decimalScale={CurrencyUtils.isCurrencyInput(stItemDetail.currency) && 2}
                                                            />
                                                            <small className='text-danger' key={`errCostPrice-${index}`}>
                                                                {stConversionUnitCostPriceErrors[index]}
                                                            </small>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div>
                                                            <AvFieldCurrency
                                                                className={stConversionUnitOrgPriceErrors[index]?"input-min-width is-invalid":"input-min-width"}
                                                                key={`unitOrgPrice-${index}`}
                                                                name={"unitOrgPrice-" + item.itemCloneId}
                                                                value={item.orgPrice}
                                                                unit={stItemDetail.currency}
                                                                onBlur={(e) => onChangeUnitOrgPrice(e, index, item.conversionUnitId, item.itemCloneId)}
                                                                position={CurrencyUtils.isPosition(stItemDetail.currency)}
                                                                precision={CurrencyUtils.isCurrencyInput(stItemDetail.currency) && '2'}
                                                                decimalScale={CurrencyUtils.isCurrencyInput(stItemDetail.currency) && 2}
                                                            />
                                                            <small className='text-danger' key={`errOrgPrice-${index}`}>
                                                                {stConversionUnitOrgPriceErrors[index]}
                                                            </small>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div>
                                                            <AvFieldCurrency
                                                                className={stConversionUnitNewPriceErrors[index]?"input-min-width is-invalid":"input-min-width"}
                                                                key={`unitNewPrice-${index}`}
                                                                name={"unitNewPrice-" + item.itemCloneId}
                                                                value={item.newPrice}
                                                                unit={stItemDetail.currency}
                                                                onBlur={(e) => onChangeUnitNewPrice(e, index, item.conversionUnitId, item.itemCloneId)}
                                                                position={CurrencyUtils.isPosition(stItemDetail.currency)}
                                                                precision={CurrencyUtils.isCurrencyInput(stItemDetail.currency) && '2'}
                                                                decimalScale={CurrencyUtils.isCurrencyInput(stItemDetail.currency) && 2}
                                                            />
                                                            <small className='text-danger' key={`errNewPrice-${index}`}>
                                                                {stConversionUnitNewPriceErrors[index]}
                                                            </small>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div>
                                                            <AvField
                                                                className="input-min-width"
                                                                key={`unitStock-${index}`}
                                                                name={`unitStock-${item.itemCloneId}`}
                                                                value={itemModelId ? Math.floor((itemModelId.totalItem/item.quantity) * 100) / 100 : Math.floor((stItemDetail.totalItem/item.quantity) * 100) / 100}
                                                                unit={CurrencySymbol.NONE}
                                                                readOnly
                                                            />
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div>
                                                            <AvFieldCurrency
                                                                key={`unitWeight-${index}`}
                                                                name={`unitWeight-${item.itemCloneId}`}
                                                                unit={CurrencySymbol.G}
                                                                value={item.weight}
                                                                onChange={(e) => onChangeUnitWeight(e, index, item.itemCloneId)}
                                                                validate={{
                                                                    number: {value: true, errorMessage: i18next.t('common.validation.number.format')},
                                                                    min: {value: VALIDATE_INPUT.MIN, errorMessage: i18next.t(ERROR_KEY.RANGE_VALUE, {x: VALIDATE_INPUT.MIN, y: VALIDATE_INPUT.MAX_PACKAGE})},
                                                                    max: {value: VALIDATE_INPUT.MAX_PACKAGE, errorMessage: i18next.t(ERROR_KEY.RANGE_VALUE, {x: VALIDATE_INPUT.MIN, y:VALIDATE_INPUT.MAX_PACKAGE})}
                                                                }}
                                                            />
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div>
                                                            <AvFieldCurrency
                                                                key={`unitLength-${index}`}
                                                                name={`unitLength-${item.itemCloneId}`}
                                                                unit={CurrencySymbol.CM}
                                                                value={item.length| 0}
                                                                onChange={(e) => onChangeUnitLength(e, index, item.itemCloneId)}
                                                                validate={{
                                                                    number: {value: true, errorMessage: i18next.t('common.validation.number.format')},
                                                                    min: {value: VALIDATE_INPUT.MIN, errorMessage: i18next.t(ERROR_KEY.RANGE_VALUE, {x: VALIDATE_INPUT.MIN, y:VALIDATE_INPUT.MAX_PACKAGE})},
                                                                    max: {value: VALIDATE_INPUT.MAX_PACKAGE, errorMessage: i18next.t(ERROR_KEY.RANGE_VALUE, {x: VALIDATE_INPUT.MIN, y:VALIDATE_INPUT.MAX_PACKAGE})}
                                                                }}
                                                            />
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div>
                                                            <AvFieldCurrency
                                                                key={`unitWidth-${index}`}
                                                                name={`unitWidth-${item.itemCloneId}`}
                                                                unit={CurrencySymbol.CM}
                                                                value={item.width | 0}
                                                                onChange={(e) => onChangeUnitWidth(e, index, item.itemCloneId)}
                                                                validate={{
                                                                    number: {value: true, errorMessage: i18next.t('common.validation.number.format')},
                                                                    min: {value: VALIDATE_INPUT.MIN, errorMessage: i18next.t(ERROR_KEY.RANGE_VALUE, {x: VALIDATE_INPUT.MIN, y:VALIDATE_INPUT.MAX_PACKAGE})},
                                                                    max: {value: VALIDATE_INPUT.MAX_PACKAGE, errorMessage: i18next.t(ERROR_KEY.RANGE_VALUE, {x: VALIDATE_INPUT.MIN, y:VALIDATE_INPUT.MAX_PACKAGE})}
                                                                }}
                                                            />
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div>
                                                            <AvFieldCurrency
                                                                key={`unitHeight-${index}`}
                                                                name={`unitHeight-${item.itemCloneId}`}
                                                                unit={CurrencySymbol.CM}
                                                                value={item.height | 0}
                                                                onChange={(e) => onChangeUnitHeight(e, index, item.itemCloneId)}
                                                                validate={{
                                                                    number: {value: true, errorMessage: i18next.t('common.validation.number.format')},
                                                                    min: {value: VALIDATE_INPUT.MIN, errorMessage: i18next.t(ERROR_KEY.RANGE_VALUE, {x: VALIDATE_INPUT.MIN, y:VALIDATE_INPUT.MAX_PACKAGE})},
                                                                    max: {value: VALIDATE_INPUT.MAX_PACKAGE, errorMessage: i18next.t(ERROR_KEY.RANGE_VALUE, {x: VALIDATE_INPUT.MIN, y:VALIDATE_INPUT.MAX_PACKAGE})}
                                                                }}
                                                            />
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </GSTable>
                            </section>
                        </AvForm>
                    </GSContentBody>
                </GSContentContainer>
                {isShowBranchListModal &&
                <BranchListModal
                    branchList={stBranchList}
                    totalItems={stBranchList.length}
                    onOpen={isShowBranchListModal}
                    onCancel={()=> onCloseBranchListModal()}
                />}
                <div className='mb-4'></div>
            </div>
        </>
       
    );
}
export default connect(mapStateToProps)(withRouter(ConversionUnitForm));
