/*******************************************************************************
 * Copyright 2019 (C) Mediastep Software Inc.
 *
 * Created on : 27/03/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React from "react";
import ProductFormEditor, {ProductFormEditorMode} from "../ProductFormEditor/ProductFormEditor";
import {ItemService} from "../../../services/ItemService";
import GSContentContainer from "../../../components/layout/contentContainer/GSContentContainer";
import {cPromise} from "../../../utils/promise";
import Constants from "../../../config/Constant";
import {RouteUtils} from "../../../utils/route";
import {NAV_PATH} from "../../../components/layout/navigation/Navigation";
import storeService from "../../../services/StoreService";
import shopeeService from "../../../services/ShopeeService";
import {CredentialUtils} from "../../../utils/credential";
import affiliateService from "../../../services/AffiliateService";
import { OrderService } from "../../../services/OrderService";

export default class ProductEdit extends React.Component {
    _isMounted = false

    state = {
        item: null,
        collectionList: [],
        collectionDefaultList: [],
        isFetching: true,
        branchList: [],
        fullBranchList: [],
        shopeeItemList: [],
        commissionList: [],
        wholesaleList: [],
        groupItemModelWholesale: [],
        totalWholeSaleList: 0,
        isFlashSaleCampaign: false,
        isChannel:false
    }

    constructor(props) {
        super(props);

        this.fetchLinkShopeeItem = this.fetchLinkShopeeItem.bind(this);
        this.fetchItem = this.fetchItem.bind(this);
        this.channel = new BroadcastChannel(Constants.CHANNEL_PRODUCT_DETAIL)
    }

    componentDidMount() {
        this._isMounted = true
        const {itemId} = this.props.match.params

        this.fetchItem(itemId)
        this.fetchLinkShopeeItem(itemId)
        this.checkFlashSaleOfProduct(itemId)
        this.checkWholesaleCampaignByProduct(itemId)
        
    }
    componentDidUpdate() {
        this.channel.onmessage = event => {
            if(event && event.data === (Constants.CHANNEL_PRODUCT_DETAIL + `-${this.props.match.params.itemId}`)){
                RouteUtils.redirectWithoutReload(this.props, NAV_PATH.productEdit + '/' + this.props.match.params.itemId)
                this.channel.close()
            }
        }
    }
    checkFlashSaleOfProduct(itemId){
        ItemService.checkFlashSaleOfProduct(itemId)
        .then((result)=>{
            // console.log('result:', result)
            if(result){
                this.setState({
                    isFlashSaleCampaign: result
                })
            }
            
        })
    }
    checkWholesaleCampaignByProduct(itemId){
        OrderService.checkWholesaleCampaignByProduct(itemId)
        .then((result)=>{
            // console.log('result:', result)
            if(result){
                this.setState({
                    isWholesaleCampaign: result
                })
            }
            
        })
        .catch((err)=> {
            console.log(err)
        })
        // .finally((e)=>{
        //     this.setState({
        //         isWholesaleCampaign: false
        //     })
        // })
    }

    fetchItem(itemId) {
        ItemService.fetch(itemId)
            .then(async result => {
                if (result.parentId) {
                    RouteUtils.redirectWithoutReload(this.props, NAV_PATH.productEdit + '/' + result.parentId)
                    return
                }

                if (this._isMounted) {
                    let newState = {}
                    // ========================
                    //  FETCH EXTENDED DATA
                    // ========================
                    this.pmGetStoreBranchList = cPromise(storeService.getActiveStoreBranches())
                    this.pmGetFullStoreBranchList = cPromise(storeService.getFullStoreBranches())
                    const branchList = await this.pmGetStoreBranchList.promise
                    const fullBranchList = (await this.pmGetFullStoreBranchList.promise).data

                    // ========================
                    //  INVENTORY PROCESSING
                    // ========================
                    result.remaining = result.totalItem - result.soldItem // migrate for old item
                    if (result.hasModel) { // => has model -> update inventory
                        result.models.forEach(model => {
                            model.remaining = 0
                            const branches = model.branches
                            model.lstInventory = branches.map(branch => {
                                if (!branch.soldItem) {
                                    branch.soldItem = 0
                                }
                                return ({
                                    branchId: branch.branchId,
                                    stock: branch.totalItem,
                                    orgStock: branch.totalItem,
                                    sku: branch.sku,
                                    soldStock: branch.soldItem,
                                })
                            })

                            // append new branch
                            branchList.forEach(nBranch => {
                                const existedBranch = model.lstInventory.find(b => b.branchId === nBranch.id)
                                if (!existedBranch) {
                                    model.lstInventory.push({
                                        branchId: nBranch.id,
                                        stock: 0,
                                        orgStock: 0,
                                        newStock: 0,
                                        soldStock: 0,
                                        sku: ''
                                    })
                                }
                            })
                            fullBranchList.forEach(nBranch => {
                                const existedBranch = model.lstInventory.find(b => b.branchId === nBranch.id)
                                if (!existedBranch) {
                                    model.lstInventory.push({
                                        branchId: nBranch.id,
                                        stock: 0,
                                        orgStock: 0,
                                        newStock: 0,
                                        soldStock: 0,
                                        sku: ''
                                    })
                                }
                            })

                            model.lstInventory.sort((a, b) => a.branchId - b.branchId)

                            model.lstInventory.forEach(b => {
                                model.remaining += b.stock
                            })
                        })
                    } else { // => get the first
                        result.lstInventory = result.branches.map(branch => {
                            if (!branch.soldItem) {
                                branch.soldItem = 0
                            }

                            return {
                                branchId: branch.branchId,
                                stock: branch.totalItem,
                                orgStock: branch.totalItem,
                                sku: branch.sku,
                                soldStock: branch.soldItem,
                            }
                        })

                        // append new branch
                        fullBranchList.forEach(nBranch => {
                            const existedBranch = result.lstInventory.find(b => b.branchId === nBranch.id)
                            if (!existedBranch) {
                                result.lstInventory.push({
                                    branchId: nBranch.id,
                                    stock: 0,
                                    orgStock: 0,
                                    newStock: 0,
                                    soldStock: 0,
                                    sku: ''
                                })
                            }
                        })

                        result.lstInventory.sort((a, b) => a.branchId - b.branchId)
                    }


                    // ========================
                    //  TAX PROCESSING
                    // ========================
                    const taxSELL=result.taxSettings.filter(tax=>tax.taxType==='SELL')
                    result.taxSettings=taxSELL
                    newState = {
                        ...newState,
                        item: result
                    }

                    // ========================
                    //  COLLECTION PROCESSING
                    // ========================
                    try {
                        this.pmGetCollectionList = cPromise(ItemService.getCollectionsList(Constants.ITEM_TYPE.BUSINESS_PRODUCT))
                        const cresult = await this.pmGetCollectionList.promise
                        if (itemId) {
                            this.pmGetDefaultCollectionList = cPromise(ItemService.getCollectionsByItemId(itemId))
                            const dresult = await this.pmGetDefaultCollectionList.promise
                            newState = {
                                ...newState,
                                collectionList: cresult.data,
                                collectionDefaultList: dresult.reverse(),
                                isFetching: false
                            }
                        } else {
                            newState = {
                                ...newState,
                                collectionList: cresult.data,
                                isFetching: false
                            }
                        }

                        newState = {
                            ...newState,
                            isFetching: false,
                            branchList: branchList,
                            fullBranchList: fullBranchList,
                        }

                    } catch (e) {

                    }

                    // ========================
                    //  RESELLER PROCESSING
                    // ========================
                    if (CredentialUtils.ROLE.RESELLER.isReSeller()) {
                        const commissionList = await affiliateService.getCommissionListByItemId(itemId)
                        newState = {
                            ...newState,
                            commissionList: commissionList
                        }
                    }

                    this.setState(newState)
                }
            }, (e) => {
                RouteUtils.redirectWithoutReload(this.props, NAV_PATH.notFound)
            })
    }

    fetchLinkShopeeItem(itemId) {
        shopeeService.getLinkedItems(itemId)
            .then(shopeeItemList => {
                this.setState({shopeeItemList})
            })
    }
    

    render() {
        const {mode, item, ...other} = this.props
        return (
            <>
                {!this.state.isFetching ?
                    <ProductFormEditor
                        itemId={this.props.match.params.itemId}
                        mode={ProductFormEditorMode.EDIT}
                        item={this.state.item}
                        collectionDefaultList={this.state.collectionDefaultList}
                        collectionList={this.state.collectionList}
                        branchList={this.state.branchList}
                        fullBranchList={this.state.fullBranchList}
                        shopeeItemList={this.state.shopeeItemList}
                        commissionList={this.state.commissionList}
                        groupItemModelWholesale={this.state.groupItemModelWholesale}
                        isWholesaleCampaign={this.state.isWholesaleCampaign}
                        isFlashSaleCampaign={this.state.isFlashSaleCampaign}
                        channelProductEdit = {()=>this.handleChannelProductEdit}
                        {...other}
                    />
                    :
                    <GSContentContainer isLoading={true}/>
                }
            </>
        )
    }
}
