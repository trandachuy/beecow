import React, { useEffect, useState } from "react";
import {useParams} from 'react-router-dom';
import GSContentContainer from "../../../../components/layout/contentContainer/GSContentContainer";
import { ItemService } from "../../../../services/ItemService";
import ConversionUnitVariation, {conversionUnitVariationMode} from "./ConversionUnitVariation";

const ConversionUnitVariationEdit = (props) => {
    const [stConversionUnitList, setStConversionUnitList] = useState([]);
    const [stListModelIdDraft, setStListModelIdDraft] = useState([]);
    const [isFetching, setIsFetching] = useState(true);

    let { itemId } = useParams();

    useEffect(() => {
        fetchConversionUnitList(itemId);
    }, []);

    const fetchConversionUnitList = async (id) => {
        ItemService.getAllTotalConversionUnits(id)
            .then((result) => {
                setStConversionUnitList(result?.lstResult);
                setStListModelIdDraft(result?.lstModelIdDraft);
                setIsFetching(false);
            })
            .catch((err) => {
                console.log(err);
                setIsFetching(false);
            });
    }

    return (
        <>
            {!isFetching ? (
                <ConversionUnitVariation
                    mode={conversionUnitVariationMode.EDIT}
                    conversionUnitVariationList={stConversionUnitList}
                    stListModelIdDraft={stListModelIdDraft}
                />
            ) : (
                <GSContentContainer isLoading={true} />
            )}
        </>
    );
};
export default ConversionUnitVariationEdit;
