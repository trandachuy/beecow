/*******************************************************************************
 * Copyright 2019 (C) Mediastep Software Inc.
 *
 * Created on : 12/07/2019
 * Author: Tien Dao <tien.dao@mediastep.com>
 *******************************************************************************/
import React from "react";
import PageFormEditor, {PageFormEditorMode} from "../PageFormEditor/PageFormEditor";
import GSContentContainer from "../../../../components/layout/contentContainer/GSContentContainer";
import { RouteUtils } from "../../../../utils/route";
import { NAV_PATH } from "../../../../components/layout/navigation/Navigation";
import pageService from "../../../../services/PageService";

export default class PageEdit extends React.Component {
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

        pageService.getPageById(itemId).then(result => {
            if (this._isMounted) {
                this.setState({
                    item: result.data
                })
            }
        }).catch(e => {
            RouteUtils.linkTo(this.props, NAV_PATH.pages);
        });


    }

    componentWillUnmount() {
        this._isMounted = false
    }

    render() {
        const {mode, item, ...other} = this.props
        return(
            <>
                {this.state.item !== null?
                    <PageFormEditor
                        mode={PageFormEditorMode.EDIT}
                        item={this.state.item}
                        {...other}/>
                        :
                    <GSContentContainer isLoading={true}/>
                }
                </>
        )
    }
}
