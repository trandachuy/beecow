/*******************************************************************************
 * Copyright 2019 (C) Mediastep Software Inc.
 *
 * Created on : 12/07/2019
 * Author: Tien Dao <tien.dao@mediastep.com>
 *******************************************************************************/
import React from "react";
import PageFormEditor, {PageFormEditorMode} from "../PageFormEditor/PageFormEditor";
import GSContentContainer from "../../../../components/layout/contentContainer/GSContentContainer";

export default class PageAddNew extends React.Component {
    render() {
        const {mode, ...other} = this.props
        return(
            <PageFormEditor 
                mode={PageFormEditorMode.ADD_NEW}
                {...other}
            />
        )
    }
}
