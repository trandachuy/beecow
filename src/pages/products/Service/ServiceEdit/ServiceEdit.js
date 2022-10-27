/*******************************************************************************
 * Copyright 2019 (C) Mediastep Software Inc.
 *
 * Created on : 21/10/2019
 * Author: Long Phan <long.phan@mediastep.com>
 *******************************************************************************/
import React, {useEffect, useState} from "react";
import ServiceFormEditor, {ServiceFormEditorMode} from "../ServiceFormEditor/ServiceFormEditor";
import {ItemService} from "../../../../services/ItemService";
import {cPromise} from "../../../../utils/promise";
import Constants from "../../../../config/Constant";

const ServiceEdit = (props) =>{
    const {mode, ...other} = props;
    const [item, setItem] = useState(props.item);
    const [isMount, setIsMount] = useState(false)
    const [collectionList, setCollectionList] = useState([]);
    const [collectionDefaultList, setCollectionDefaultList] = useState([]);
    const [isFetching, setIsFetching] = useState(true);
    
    useEffect(()=> {
        const {itemId} = props.match.params;
        if(!isMount){
            fetchItem(itemId);
        }
        return () => { setIsMount(true)};
    }, [collectionList])

    const fetchItem = (itemId) => {
        ItemService.fetch(itemId).then((result) => {
            const pmGetCollectionList = cPromise(ItemService.getCollectionsList(Constants.ITEM_TYPE.SERVICE))
            pmGetCollectionList.promise.then((cresult) => {
                if (itemId) {
                    const pmGetDefaultCollectionList = cPromise(ItemService.getCollectionsByItemId(itemId))
                    pmGetDefaultCollectionList.promise.then((dresult) => {
                        setCollectionList(cresult.data);
                        setCollectionDefaultList(dresult);
                        setIsFetching(false);
                    })
                } else {
                    setCollectionList(cresult.data);
                    setIsFetching(false);
                }
                setItem(result);
            })});
    }
    return (
        <>
        {!isFetching &&
            <ServiceFormEditor
                mode={ServiceFormEditorMode.EDIT}
                item={item}
                collectionDefaultList={collectionDefaultList}
                collectionList={collectionList}
                {...other}/>
        }
        {isFetching && <ServiceFormEditor isLoading={true}/>}
        </>
    )
}
export default ServiceEdit;
