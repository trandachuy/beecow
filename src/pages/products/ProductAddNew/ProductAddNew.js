/*******************************************************************************
 * Copyright 2019 (C) Mediastep Software Inc.
 *
 * Created on : 27/03/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React from "react";
import ProductFormEditor, {ProductFormEditorMode} from "../ProductFormEditor/ProductFormEditor";
import GSContentContainer from "../../../components/layout/contentContainer/GSContentContainer";
import {cPromise} from "../../../utils/promise";
import {ItemService} from "../../../services/ItemService";
import Constants from "../../../config/Constant";
import storeService from "../../../services/StoreService";

export default class ProductAddNew extends React.Component {

    state = {
        collectionList: [],
        branchList: [],
        isFetching: true
    }

    componentDidMount() {

        // get all collections
        this.pmGetCollectionList = cPromise(ItemService.getCollectionsList(Constants.ITEM_TYPE.BUSINESS_PRODUCT))
        this.pmGetCollectionList.promise
            .then( result => {
                // console.log(result)
                this.setState({
                    isFetching: false,
                    collectionList: result.data
                })
            })
            .catch(e => {
                this.setState({
                    isFetching: false
                })
            })

        // get all branches
        this.pmGetStoreBranchList = cPromise(storeService.getActiveStoreBranches())
        this.pmGetStoreBranchList.promise
            .then(branchList => {
                this.setState({
                    isFetching: false,
                    branchList: branchList
                })
            })
            .catch(e => {
                this.setState({
                    isFetching: false
                })
            })
    }

    componentWillUnmount() {
        if (this.pmGetCollectionList) {
            this.pmGetCollectionList.cancel()
        }
    }

    render() {
        const {mode, collectionList, ...other} = this.props

        return(
            <>
                {!this.state.isFetching &&
                <ProductFormEditor
                    mode={ProductFormEditorMode.ADD_NEW}
                    collectionList={this.state.collectionList}
                    branchList={this.state.branchList}
                    {...other}
                />}
                {this.state.isFetching && <GSContentContainer isLoading={true}/>}
            </>
        )
    }
}
