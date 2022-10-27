/*******************************************************************************
 * Copyright 2019 (C) Mediastep Software Inc.
 *
 * Created on : 01/07/2019
 * Author: Tien Dao <tien.dao@mediastep.com>
 *******************************************************************************/
import React from "react";
import CollectionFormEditor, {CollectionFormEditorMode} from "../CollectionFormEditor/CollectionFormEditor";
import {CollectionService} from "../../../services/CollectionService";
import GSContentContainer from "../../../components/layout/contentContainer/GSContentContainer";
import {RouteUtils} from "../../../utils/route";
import {NAV_PATH} from "../../../components/layout/navigation/Navigation";

export default class CollectionEdit extends React.Component {
    _isMounted = false

    constructor(props) {
        super(props)

        this.state = {
            item: null
        }
    }

    componentDidMount() {
        this._isMounted = true
        const {itemId} = this.props.match.params

        CollectionService.getCollectionDetailForEdit(itemId).then(result => {
            if (this._isMounted) {
                this.setState({
                    item: result
                })
            }
        }).catch(e => {
            RouteUtils.linkTo(this.props, NAV_PATH.collections);
        });


    }

    componentWillUnmount() {
        this._isMounted = false
    }

    render() {
        const {mode, item, ...other} = this.props
        const {itemType} = this.props.match.params

        return(
                <>
                    {this.state.item !== null?
                        <CollectionFormEditor
                            mode={CollectionFormEditorMode.EDIT}
                            item={this.state.item}
                            itemType={itemType.toUpperCase()}
                            {...other}/>
                            :
                        <GSContentContainer isLoading={true}/>
                    }
                </>
        )
    }
}
