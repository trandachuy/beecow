/*******************************************************************************
 * Copyright 2019 (C) Mediastep Software Inc.
 *
 * Created on : 21/10/2019
 * Author: Long Phan <long.phan@mediastep.com>
 *******************************************************************************/
import React, {useEffect, useState} from "react";
import ServiceFormEditor, {ServiceFormEditorMode} from "../ServiceFormEditor/ServiceFormEditor";
import GSContentContainer from "../../../../components/layout/contentContainer/GSContentContainer";
import {cPromise} from "../../../../utils/promise";
import {ItemService} from "../../../../services/ItemService";
import Constants from "../../../../config/Constant";

const ServiceAddNew = (props) => {

    const {mode, ...other} = props;
    const [isMount, setIsMount] = useState(false)
    const [collectionList, setCollectionList] = useState(props.collectionList || [])
    const [isFetching, setIsFetching] = useState(true);
    const [pmGetCollectionList, setPmGetCollectionList] = useState(cPromise(ItemService.getCollectionsList(Constants.ITEM_TYPE.SERVICE)));

    useEffect(() => {
        if(!isMount){
            getCollections()
        }
     return () => { setIsMount(true)};
    }, [collectionList])
    
    const getCollections = () => {
        pmGetCollectionList.promise.then(res => {
            setIsFetching(false);
            setCollectionList(res.data);
       }) ;
    }
    return (
        <>
        {!isFetching &&
            <ServiceFormEditor
                mode={ServiceFormEditorMode.ADD_NEW}
                collectionList={collectionList}
                {...other}
            />}
        {isFetching && <GSContentContainer isLoading={true}/>}
    </>
    )
}
export default ServiceAddNew;
