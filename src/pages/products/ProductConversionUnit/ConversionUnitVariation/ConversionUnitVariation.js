import React, {useEffect, useRef, useState} from 'react';
import './ConversionUnitVariation.sass';
import GSFakeLink from "../../../../components/shared/GSFakeLink/GSFakeLink";
import GSTrans from "../../../../components/shared/GSTrans/GSTrans";
import GSButton from "../../../../components/shared/GSButton/GSButton";
import GSWidget from "../../../../components/shared/form/GSWidget/GSWidget";
import GSContentBody from "../../../../components/layout/contentBody/GSContentBody";
import GSContentContainer from "../../../../components/layout/contentContainer/GSContentContainer";
import LoadingScreen from "../../../../components/shared/LoadingScreen/LoadingScreen";
import {LoadingStyle} from "../../../../components/shared/Loading/Loading";
import {RouteUtils} from "../../../../utils/route";
import {NAV_PATH} from "../../../../components/layout/navigation/Navigation";
import {useParams, withRouter} from "react-router-dom";
import {ItemService} from "../../../../services/ItemService";
import {Trans} from "react-i18next";
import {Modal, ModalBody, ModalFooter, ModalHeader} from "reactstrap";
import i18next from "i18next";
import {ItemUtils} from "../../../../utils/item-utils";
import {AvForm, AvRadio, AvRadioGroup} from "availity-reactstrap-validation";
import {conversionUnitMode} from "../ConversionUnitForm/ConversionUnitForm";
import {GSToast} from "../../../../utils/gs-toast";
import {ProductWholesaleEditMode} from "../../ProductWholesalePrice/ProductWholesalePrice";

export const conversionUnitVariationMode = {
    ADD_NEW: 'ADD_NEW',
    EDIT: 'EDIT'
}

const ConversionUnitVariation = (props) => {
    const [models, setModels] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    const [isModalSelectVariation, setIsModalSelectVariation] = useState(false);
    const [checkErrs, setCheckErrs] = useState(false)
    const [stSelectedByModels, setStSelectedByModels] = useState([]);
    const [allSelectedVariationIds, setAllSelectedVariationIds] = useState([]);
    const [stConversionUnit, setStConversionUnit] = useState([]);
    const [stPrevSelectedByModels, setStPrevSelectedByModels] = useState([]);
    const [isEditByModels, setIsEditByModels] = useState(false);

    const refAddVariationForm = useRef();
    let { itemId } = useParams();
    const listModelItemId = props.location.state ? props.location.state.listModelItemId : []

    useEffect(() => {
        setModels(listModelItemId)
        fetchConversionUnitListEdit(listModelItemId)
    }, [])

    const fetchConversionUnitListEdit = (model) => {
        if(props.conversionUnitVariationList && props.conversionUnitVariationList.length > 0){
            let listUnit = props.conversionUnitVariationList
            let getAllSelected = allSelectedVariationIds;

            for (const unit of listUnit) {
                let items = model.find(r => unit.modelId.toString().includes(r.id))
                let itemModelIds = getItemModelIds([unit.modelId])
                let totalUnit = unit.total
                if (items) addNewConversionUnit(itemModelIds, items, totalUnit)
                getAllSelected = getAllSelected.concat(unit.modelId)
                setAllSelectedVariationIds(getAllSelected)
            }
            fetchConversionUnitListIdDraft(model, getAllSelected)
        } else {
            fetchConversionUnitListIdDraft(model, [])
        }
    }

    const fetchConversionUnitListIdDraft = (model, getAllSelected) => {
        if(props.stListModelIdDraft && props.stListModelIdDraft.length > 0) {
            let listIdDraft = props.stListModelIdDraft

            for (const id of listIdDraft) {
                let items = model.find(r => id.toString().includes(r.id))
                let itemModelIds = getItemModelIds([id])
                let totalUnit = 0
                if (items) addNewConversionUnit(itemModelIds, items, totalUnit)
                getAllSelected = getAllSelected.concat(id)
                setAllSelectedVariationIds(getAllSelected)
            }
        }
    }

    const renderBackProductDetail = (e) => {
        if (props.mode === conversionUnitVariationMode.ADD_NEW){
            if (stConversionUnit.totalUnit > 0) {
                setCheckErrs(true)
            } else {
                RouteUtils.redirectWithoutReload(props, NAV_PATH.productEdit + `/${itemId}`)
            }
        } else {
            if (props.stListModelIdDraft.length > 0) {
                setCheckErrs(true)
            } else {
                RouteUtils.redirectWithoutReload(props, NAV_PATH.productEdit + `/${itemId}`)
            }
        }
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

    const handleOnSubmitVariation = () => {
        let getAllSelected = [...allSelectedVariationIds];
        let segmentId = stSelectedByModels;
        let items = models.find(r => segmentId.toString().includes(r.id))
        let itemModelIds = getItemModelIds([segmentId])

        if(isEditByModels) {
            if(props.mode === conversionUnitVariationMode.ADD_NEW) {
                let prevModelIds = getItemModelIds(stPrevSelectedByModels)

                const unitConversion = stConversionUnit.find(r => r.itemModelIds === prevModelIds)
                let conversionSelected = allSelectedVariationIds.filter(r => r !== stPrevSelectedByModels[0])
                conversionSelected = [...conversionSelected, segmentId]
                setAllSelectedVariationIds(conversionSelected)

                if (unitConversion) {
                    unitConversion.itemModelIds = itemModelIds
                }
            } else {
                if (segmentId.length !== 0){
                    updateVariationByItemModel(segmentId)
                }
            }
        } else {
            if (items)
            addNewConversionUnit(itemModelIds, items)
            getAllSelected = getAllSelected.concat(segmentId)
            setAllSelectedVariationIds(getAllSelected)
        }
        setIsModalSelectVariation(false)
    }

    const addNewConversionUnit = (itemModelIds, items, totalUnit) => {
        let data = {
            itemModelIds: itemModelIds,
            itemId: itemId,
            modelId: items.id,
            orgPrice: items.orgPrice,
            costPrice: items.costPrice,
            newPrice: items.newPrice,
            sku: items.sku,
            totalItem: items.totalItem,
            name: items.orgName ? items.orgName.split(" ").filter(n => n !== '[100P3rc3nt]').join(" ") : items.name.split("|").filter(n => n !== '[100P3rc3nt]').join(" "),
            totalUnit: totalUnit ? totalUnit : 0
        }
        stConversionUnit.push(data)
    }

    const updateVariationByItemModel = (itemModelIdsNew) => {
        let request = {
            itemId: parseInt(itemId),
            modelIdOld: stPrevSelectedByModels[0],
            modelIdNew : itemModelIdsNew
        }
        setIsSaving(true)

        ItemService.updateVariationByModel(request)
            .then(() => {
                setTimeout(() => {
                    GSToast.commonUpdate()
                    window.location.reload()
                    setIsSaving(false)
                }, 500)
            })
            .catch(e => {
                console.log('error:', e)
                GSToast.commonError()
            })
    }

    const removeItemModel = (itemModelIds, segmentId, totalUnit) => {
        if(props.mode === conversionUnitVariationMode.ADD_NEW) {
            setStSelectedByModels([])
            removeData(itemModelIds, segmentId)
        } else {
            handleRemoveByItemModelIds(itemModelIds, segmentId)
        }
    }

    const removeData = (itemModelIds, segmentId) => {
        setStConversionUnit(prev => {
            prev = prev.filter(r => r.itemModelIds !== itemModelIds)
            return [...prev]
        })

        setAllSelectedVariationIds(prev => {
            prev = prev.filter(r => !segmentId.toString().includes(r))
            return [...prev]
        })
    }

    const handleRemoveByItemModelIds = (itemModelIds, segmentIds) => {
        setIsSaving(true)
        ItemService.deleteVariationByModel(itemId ,segmentIds)
            .then(result => {
                if(result.status === 1){
                    setIsSaving(false)
                    setTimeout(() => {
                        GSToast.commonUpdate()
                        removeData(itemModelIds, segmentIds)
                    }, 500)
                }else{
                    GSToast.error(result.description);
                    console.log('error:', result)
                }
            })
            .catch((err)=> {
                GSToast.commonError()
            })
    }

    const getNameOfItemModels = (models, itemModelIds) => {
        let listName = []

        if(!models) return
        let getModel = models.filter(r => itemModelIds.includes(String(itemId) + "_" + String(r.id)));
        if(getModel){
            for(const {name} of getModel){
                let formatName = ItemUtils.escape100Percent(name)
                listName.push(formatName)
            }
        }

        return listName
    }

    const configUnitConversion = (item) => {
        let request = []
        for (const item of stConversionUnit) {
                let data = {
                    itemId: itemId,
                    modelId: item.modelId,
                }
                request.push(data)
        }

        ItemService.updateVariationByModelNoConversionUnit(request)
            .catch(e => {
                console.log('error:', e)
                GSToast.commonError()
            })
        if (item.totalUnit == 0){
            RouteUtils.redirectWithoutReloadWithData(props, NAV_PATH.productConversionUnitCreate + `/${itemId}`, {
                itemModelId: item
            })
        } else {
            RouteUtils.redirectWithoutReloadWithData(props, NAV_PATH.productConversionUnitEdit + `/${itemId}`, {
                itemModelId: item
            })
        }
    }

    const closeModalVariation = () => {
        setStSelectedByModels([])
        setIsEditByModels(false)
        setIsModalSelectVariation(false)
    }

    const openModalVariation = (itemModelIds) => {
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
            setStPrevSelectedByModels(ids)
            setIsEditByModels(true)
        }
        setIsModalSelectVariation(true)
    }

    const onChangeVariation = _.debounce(id => {
        setStSelectedByModels(id)
    }, 100)

    const modalSelectVariation = () => {
        return (
            <Modal isOpen={isModalSelectVariation} toggle={closeModalVariation} className='modalSelectVariation'>
                <ModalHeader toggle={closeModalVariation}>{i18next.t("page.product.conversionUnit.variation.title")}</ModalHeader>
                <ModalBody>
                    <AvForm onValidSubmit={handleOnSubmitVariation} autoComplete="off" ref={refAddVariationForm}>
                        <AvRadioGroup
                            className="w-100"
                            onChange={e => parseInt(e.target?.value) && onChangeVariation(parseInt(e.target.value))}
                            name="variationUnit"
                        >
                            <div className="checkbox_variation col-12 row">
                                {models.map(item => {
                                    let isCheckedBtn = false
                                    const isSelectedByModel = allSelectedVariationIds.includes(item.id)
                                    if(isSelectedByModel){
                                        isCheckedBtn = true
                                    }
                                    return (
                                        <div key={item.id} className="variation-name">
                                            <AvRadio
                                                disabled={isCheckedBtn ? true : false}
                                                className={isCheckedBtn ? 'is-checked' : ''}
                                                customInput
                                                value={item.id}
                                                label={ItemUtils.escape100Percent(item.name)}
                                            />
                                        </div>
                                    )
                                })}
                            </div>
                        </AvRadioGroup>
                        <ModalFooter>
                            <GSButton secondary outline marginLeft onClick={closeModalVariation}>
                                <GSTrans t={"common.btn.cancel"}/>
                            </GSButton>
                            <GSButton success marginLeft>
                                <GSTrans t={"common.btn.ok"}/>
                            </GSButton>
                        </ModalFooter>
                    </AvForm>
                </ModalBody>


            </Modal>
        )
    }

    return (
        <div className="container-fluid mb-4 w-100">
            {modalSelectVariation()}
            {isSaving && <LoadingScreen zIndex={9999} loadingStyle={LoadingStyle.ELLIPSIS_GREY}/>}
            <GSContentContainer className="conversion-unit-page-variation"
                                minWidthFitContent
                                isSaving={isSaving}>
                <div className='d-flex justify-content-between align-items-center w-100'>
                    <GSFakeLink className='ml-2' onClick={()=> renderBackProductDetail()}>
                        &#8592; <GSTrans t="page.product.wholesalePrice.go_back_to_product_detail"/>
                    </GSFakeLink>
                    <div className='d-flex align-items-center'>
                        <GSButton success outline marginRight onClick={() => openModalVariation()}>
                            <GSTrans t={"page.product.conversionUnit.variation.title"}/>
                        </GSButton>
                        <GSButton success onClick={() => renderBackProductDetail()}>
                            <GSTrans t={"common.btn.save"}/>
                        </GSButton>
                    </div>
                </div>
                <h5 className='d-flex justify-content-start font-weight-bold w-100'>
                    <Trans i18nKey="page.productDetail.set.up.conversion.unit">
                        Set Up Wholesale Price
                    </Trans>
                </h5>
                <GSContentBody>
                    {stConversionUnit.length > 0 && stConversionUnit.map((item, index) => {
                        let variationName = getNameOfItemModels(models, item.itemModelIds)

                        return(<GSWidget className={"gs-widget-variation"} key={item.id}>
                            <div className="conversion-variation d-flex justify-content-between align-items-center p-3">
                                <div className='name-variation'>{variationName ? variationName : ''}</div>
                                <div className='action-variation'>
                                    <GSFakeLink onClick={()=> removeItemModel(item.itemModelIds, item.modelId, item.totalUnit)}>
                                        <GSTrans t={"common.btn.delete"}/>
                                    </GSFakeLink>
                                    <GSFakeLink
                                        className='ml-4'
                                        onClick={() => openModalVariation(item.itemModelIds)}>
                                        <GSTrans t={"common.btn.edit"}/>
                                    </GSFakeLink>
                                </div>
                            </div>
                            <div className="conversion-configure d-flex justify-content-between align-items-center p-3">
                                <div className='title-configure'>
                                    {item.totalUnit > 0 ?
                                        <p className='m-0'>
                                            {i18next.t('page.productDetail.message.added.conversion.units', {x: item.totalUnit})}
                                        </p> :
                                        <p className={'m-0' + ' ' + (checkErrs ? 'error_unit' : '')}><GSTrans t={"page.productDetail.text.dont.add.any.conversion.unit"}/></p>
                                    }
                                </div>
                                <GSButton primary outline onClick={() => configUnitConversion(item)}>
                                    <GSTrans t={"common.btn.configure"}/>
                                </GSButton>
                            </div>
                        </GSWidget>)
                    })}

                    {allSelectedVariationIds.length == 0 && (
                        <div className='bg-white w-100 mt-3 d-flex justify-content-center align-items-center' style={{minHeight: '270px'}}>
                            <p>
                                <GSTrans t={"page.productDetail.text.dont.add.any.conversion.unit"}/>
                            </p>
                        </div>
                    )}

                </GSContentBody>
            </GSContentContainer>
        </div>
    );
}
export default withRouter(ConversionUnitVariation);
