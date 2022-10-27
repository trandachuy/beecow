/*******************************************************************************
 * Copyright 2019 (C) Mediastep Software Inc.
 *
 * Created on : 25/06/2019
 * Author: Tien Dao <tien.dao@mediastep.com>
 *******************************************************************************/
import React from "react";
import CollectionFormEditor, {CollectionFormEditorMode} from "../CollectionFormEditor/CollectionFormEditor";

export default class CollectionAddNew extends React.Component {
    render() {
        const {mode, ...other} = this.props
        const {itemType} = this.props.match.params

        return(
            <CollectionFormEditor 
                mode={CollectionFormEditorMode.ADD_NEW}
                itemType={itemType.toUpperCase()}
                {...other}
            />
        )
    }
}
