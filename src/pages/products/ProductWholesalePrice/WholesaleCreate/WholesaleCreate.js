import React, { useState, useRef, useEffect } from 'react';
import ProductWholesalePrice, {ProductWholesaleEditMode} from '../ProductWholesalePrice';
import {useParams} from "react-router-dom";
import {ItemService} from '../../../../services/ItemService';
import GSContentContainer from '../../../../components/layout/contentContainer/GSContentContainer';

const ProductWholesalePriceCreate = (props) => {

    const [isFetchingItem, setIsFetchingItem] = useState([])
    const [hasModel, setHasModel] = useState(false)
    const [salePrice, setSalePrice] = useState(0)
    const [models, setModels] = useState([])

    let {itemId} = useParams()
    
    useEffect(() => {
        fetchItem(itemId)
    },[])
    
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
        })
        .catch((err)=>{
            console.log(err)
        })
    }
    const handleModelWithoutDeposit = (models) => {
        if(!models.find(model => model.label.includes("[d3p0s1t]"))) return models
        const excludedDeposit = models.filter(model => model.name.includes("[100P3rc3nt]"));
       return excludedDeposit
    }

    return (
        <>
            {isFetchingItem? 
                <GSContentContainer isLoading={true}/>
            : <ProductWholesalePrice
                mode={ProductWholesaleEditMode.ADD_NEW}
                hasModel={hasModel}
                models={models}
                salePrice={salePrice}
                {...props}

            />}
            
        </>
        
    );
} 
export default ProductWholesalePriceCreate;
