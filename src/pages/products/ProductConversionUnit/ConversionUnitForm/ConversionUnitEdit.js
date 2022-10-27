import React, { useEffect, useState } from "react";
import {useParams} from 'react-router-dom';
import GSContentContainer from "../../../../components/layout/contentContainer/GSContentContainer";
import { ItemService } from "../../../../services/ItemService";
import ConversionUnitForm, { conversionUnitMode } from "./ConversionUnitForm";

const ConversionUnitEdit = (props) => {
    const [stConversionUnitList, setStConversionUnitList] = useState([]);
    const [stListModelId, setStListModelId] = useState([]);
    const [isFetching, setIsFetching] = useState(true);

    let { itemId } = useParams();
    const itemModelId = props.location.state ? props.location.state.itemModelId : null;

    useEffect(() => {
        fetchConversionUnitList(itemId);
    }, []);

    const fetchConversionUnitList = async (id) => {
        if (itemModelId?.modelId) {
            ItemService.getConversionUnitByModel(id, itemModelId?.modelId)
                .then((result) => {
                    setStConversionUnitList(result);
                    setIsFetching(false);
                })
                .catch((err) => {
                    console.log(err);
                    setIsFetching(false);
                });
        } else {
            ItemService.getAllConversionUnits(id)
                .then((result) => {
                    setStConversionUnitList(result?.lstResult[0].data);
                    setStListModelId(result?.lstModelId);
                    setIsFetching(false);
                })
                .catch((err) => {
                    console.log(err);
                    setIsFetching(false);
                });
        }
    }

    return (
        <>
            {!isFetching ? (
                <ConversionUnitForm
                    mode={conversionUnitMode.EDIT}
                    conversionUnitList={stConversionUnitList}
                    stListModelId={stListModelId}
                />
            ) : (
                <GSContentContainer isLoading={true} />
            )}
        </>
    );
};
export default ConversionUnitEdit;
