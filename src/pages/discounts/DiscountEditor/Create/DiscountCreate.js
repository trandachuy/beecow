/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 09/08/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React from 'react';
import DiscountEditor, {DiscountEditorMode} from "../Editor/DiscountEditor";

const DiscountCreate = props => {

    const {...other} = props

    return (
        <DiscountEditor 
            mode={DiscountEditorMode.CREATE} 
            discountType={props.match.params.discountsType}
            {...other}
        />
    );
};

DiscountCreate.propTypes = {

};

export default DiscountCreate;
