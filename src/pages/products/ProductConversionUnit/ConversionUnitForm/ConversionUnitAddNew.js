import React from 'react';
import ConversionUnitForm, { conversionUnitMode } from './ConversionUnitForm';

const ConversionUnitAddNew = () => {
    return (
        <>
            <ConversionUnitForm
                mode={conversionUnitMode.ADD_NEW}
                
            />
        </>
    );
}
export default ConversionUnitAddNew;
