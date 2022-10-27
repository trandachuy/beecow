import React from 'react';
import ConversionUnitVariation, { conversionUnitVariationMode } from "./ConversionUnitVariation";

const ConversionUnitVariationAddNew = () => {
    return (
        <>
            <ConversionUnitVariation
                mode={conversionUnitVariationMode.ADD_NEW}
                
            />
        </>
    );
}
export default ConversionUnitVariationAddNew;
