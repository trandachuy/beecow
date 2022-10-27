import React, { useState, useRef, useEffect } from 'react';
import ProductWholesalePrice, {ProductWholesaleEditMode} from '../ProductWholesalePrice';
// import {useParams} from "react-router-dom";
// import {ItemService} from '../../../../services/ItemService';

const ProductWholesaleEdit = (props) => {
    // const [salePrice, setSalePrice] = useState(0);
    // const [hasModel, setHasModel] = useState(false);
    // const [models, setModels] = useState([]);
    // const [stWholesalePrice, setStWholesalePrice]= useState([]);
    // const [allSelectedVariationIds, setAllSelectedVariationIds] = useState([]);
    // const [stSelectedGroupVars, setStSelectedGroupVars] = useState([]);
    // const [stSelectedByModels, setStSelectedByModels] = useState("");
    // const [groupItemModelWholesale, setGroupItemModelWholesale] = useState([]);
    // const [totalWholesale, setTotalWholesale] =  useState(0);

    // let { itemId } = useParams();

    // useEffect(() => {
    //     fetchItem(itemId)
    //     fetchWholesalePricing(itemId)
    // },[])

    // const handleModelWithoutDeposit = (models) => {
    //     if(!models.find(model => model.label.includes("[d3p0s1t]"))) return
    //     const excludedDeposit = models.filter(model => model.name.includes("[100P3rc3nt]"));
    //    return excludedDeposit
    // }

    // const fetchItem =(itemId) => {
    //     ItemService.fetch(itemId)
    //     .then(async result => {
    //         setSalePrice(result?.newPrice)
    //         if(result.models) {
    //             let filterModel = handleModelWithoutDeposit(result?.models)
    //             if(filterModel && filterModel.length > 0){
    //                 setModels(filterModel)
    //                 setHasModel(result?.hasModel)
    //             }else{
    //                 setHasModel(false)
    //             }
                
    //         }
            
    //     })
    //     .catch((err)=>{
    //         console.log(err)
    //     })
    // }

    // const listSelectedVariations = (lstItemModelIds) => {
    //     let selectedIds = []
    //     let getLstModels = []
    //     for (const item of lstItemModelIds){
    //         let plusSymbol =  item.indexOf(',')
    //         if(plusSymbol){
    //             getLstModels.push(item.split(','))
                
    //         }else{
    //             getLstModels.push(item)
    //         }
    //     }
    //     for(const groupIds of getLstModels){
    //         for(const data of groupIds){
    //             let findIdx = data.indexOf('_')
    //             if(findIdx){
    //                 let id = data.slice(findIdx + 1, data.length)
    //                 selectedIds.push(parseInt(id))
    //             }
    //         }
    //     }
    //     return selectedIds
    // }

    // const fetchWholesalePricing = (itemId, page=0) => {
    //     ItemService.getAllWholesalePrice(itemId, page)
    //         .then(result => {
    //             setStWholesalePrice(result.lstResult)
    //             // setGroupItemModelWholesale(result.lstItemModelIds)
    //             let listVars = listSelectedVariations(result.lstItemModelIds)
    //             if(listVars.length === 1 && listVars[0] == itemId){
    //                 return
    //             }else{
    //                 //setStSelectedGroupVars(listVars)
    //                 setAllSelectedVariationIds(listVars)
    //                 setGroupItemModelWholesale(result.lstItemModelIds)
    //                 //console.log('listName')
    //             }
    //             setTotalWholesale(result.total)

    //         })
    //         .catch((err)=> {
    //             console.log(err)
    //         })
    // }

    return (
        <ProductWholesalePrice
            mode={ProductWholesaleEditMode.EDIT}
            // salePrice={salePrice}
            // hasModel={hasModel}
            // models={models}
            // wholesaleList={stWholesalePrice}
            // totalWholesale={totalWholesale}
            // allSelectedVariationIds={allSelectedVariationIds}
        />
    );
} 
export default ProductWholesaleEdit;
