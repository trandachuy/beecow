/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 11/05/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Trans} from "react-i18next";
import './ShopeeEditProductVariantsTable_2.sass'
import {AvField, AvForm} from 'availity-reactstrap-validation'
import i18next from "i18next";
import {CurrencySymbol} from "../../../../../components/shared/form/CryStrapInput/CryStrapInput";
import Constants from "../../../../../config/Constant";
import accounting from 'accounting-js'
import AlertInline from "../../../../../components/shared/AlertInline/AlertInline";

class ShopeeEditProductVariantsTable_2 extends Component {
    DEFAULT_LABEL = 'Beecow'

    

    constructor(props) {
        super(props);

        this.renderModels = this.renderModels.bind(this);
        this.onModelLabelChange = this.onModelLabelChange.bind(this);
        this.onModelValueChange = this.onModelValueChange.bind(this);
        this.isTwoVariants = this.isTwoVariants.bind(this);
        this.getVariations = this.getVariations.bind(this);
        this.getTiers = this.getTiers.bind(this);
        this.onFieldChange = this.onFieldChange.bind(this);
        this.priceValidation = this.priceValidation.bind(this);
        this.isInvalidForm = this.isInvalidForm.bind(this);
        this.checkMaxPriceVariant = this.checkMaxPriceVariant.bind(this);
        this.sortVariation = this.sortVariation.bind(this);
        this.mapVariation = this.mapVariation.bind(this);
        this.resolveStockQuantity = this.resolveStockQuantity.bind(this);

        this.refFrom = React.createRef();

        this.unitFormat = {
            symbol: CurrencySymbol.VND,
            thousand: ',',
            precision: 0,
            format: "%v%s"
        };

        this.thousandFormat = {
            symbol: CurrencySymbol.VND,
            thousand: ',',
            precision: 0,
            format: "%v"
        };

        this.state = {
            variations: this.mapVariation(),
            tiers: this.props.tiers,
            hasError10Time : false
        }
        this.sortVariation();
    }

    mapVariation() {
        const clonedVariation = [...this.props.variations]
        clonedVariation.forEach(variation => {
            variation.totalItem = this.resolveStockQuantity(variation)
        })
    }

    sortVariation(){
        let oneOrTwo = this.state.tiers.length;

        let variations = this.state.variations;
        variations.sort((a,b) => {
            let aSplit = a.tierIndex.split(',');
            let bSplit = b.tierIndex.split(',');

            let sub = parseInt(aSplit[0]) - parseInt(bSplit[0]);
            
            if(oneOrTwo === 1){
                return sub;
            }else{
                if(sub === 0){
                    return parseInt(aSplit[1]) - parseInt(bSplit[1]);
                }else{
                    return sub;
                }
            }
        });

        // change tier options to list
        let tierVariations = this.state.tiers;
        this.state.tiers.forEach((tier , index) =>{
            let lstOptions = tier.options.split(',');
            let lstOptionsT = [];

            lstOptions.forEach(op => {
                lstOptionsT.push(op.replace(/\(%2C\)/g, ","));
            });

            tierVariations[index].options = lstOptionsT;
        });

        // set product
        this.setState({
            variations : variations,
            tiers : tierVariations
        });
    }

    checkMaxPriceVariant(){
        // check ten time max
        let variations = this.state.variations;
        let min = 10000000000;
        let max = 0;

        variations.forEach(va =>{

            let price = parseInt(va.newPrice);

            if(price){
                if(min > price){
                    min = price;
                }
                
                if(max < price){
                    max = price;
                }
            }
            
        });

        if(max / min > 10){
            this.setState({hasError10Time : true})
            return true;
        }

        this.setState({hasError10Time : false})
        return false;
    }

    isInvalidForm(){

        if(this.refFrom.current.hasError()){
            return true;
        }

        return this.checkMaxPriceVariant();
    }

    onFieldChange(row, value, name){
        let variations = this.state.variations;

        if(name === "sku"){
            variations[row].sku = value;
        }else if(name === "price"){
            let intData = (value + '').split(',').join('');
            variations[row].newPrice = intData ? parseInt(intData) : 0;
        }else if(name === "stock"){
            let intData = (value + '').split(',').join('');
            variations[row].totalItem = intData ? parseInt(intData) : 0;
            variations[row].soldItem = 0;
        }

        this.setState({variations : variations});
    }

    componentDidMount() {
    }

    onModelValueChange(tier_position, optionPosition, value, variationPosition) {

        // update tier position
        let tiers = this.state.tiers;
        let tier = tiers[tier_position];
        
        tier.options[optionPosition] = value;
        tiers[tier_position] = tier;

        this.setState({tiers : tiers});
    }

    onModelLabelChange(colIndex, value) {
        let tiers = this.state.tiers;
        tiers[colIndex].name = value;
        this.setState({tiers: tiers})
    }

    isTwoVariants() {
        return this.state.tiers.length > 1;
    }

    getVariations(){
        if (!this.props.syncPrice) { // revert price
            const varList = [...this.state.variations]

            for (const variation of varList ) {
                const orgVar = this.props.variations.find(varn => varn.id === variation.id)

                if (orgVar) {
                    variation.newPrice = orgVar.orgPrice
                }
            }
            return varList
        }

        return this.state.variations;
    }

    getTiers(){
        return this.state.tiers;
    }

    priceValidation = (value, ctx) => {

        let intData = (value + '').split(',').join('');

        if (isNaN(intData)) {
            let message = i18next.t("common.validation.number.format");
            return message;
        }

        if (parseInt(intData) < Constants.N10_000) {
            let message = i18next.t("common.validation.number.min.value",{ 
                x: accounting.formatMoney(Constants.N10_000, this.unitFormat)
            });
            return message;
        }
 
        if(parseInt(intData) > Constants.N100_000_000){
            let message = i18next.t("common.validation.number.max.value",{ 
                x: accounting.formatMoney(Constants.N100_000_000, this.unitFormat)
            });
            return message;
        }

        return true;
    }

    stockValidation = (value, ctx) => {
        let intData = (value + '').split(',').join('');

        if (isNaN(intData)) {
            let message = i18next.t("common.validation.number.format");
            return message;
        }

        if (parseInt(intData) < 0 ) {
            let message = i18next.t("common.validation.number.min.value",{ 
                x: accounting.formatMoney(0, this.thousandFormat)
            });
            return message;
        }
 
        if(parseInt(intData) > Constants.N1_000){
            let message = i18next.t("common.validation.number.max.value",{ 
                x: accounting.formatMoney(Constants.N1_000, this.thousandFormat)
            });
            return message;
        }

        return true;
    }

    duplicateValidation = (value, ctx) =>{
        if(this.isTwoVariants()){
            if(ctx["label0"] === ctx["label1"]){
                return i18next.t('page.shopee.product.edit.variant_duplicate.title');
            }
        }
        return true;
    }

    resolveStockQuantity(model) {
        const currentShop = this.props.shopeeItem.shop
        if (currentShop) {
            const {branchId} = currentShop
            const productBranchList = model.branches
            const productMatchedBranch = productBranchList.find(branch => branch.branchId == branchId)
            if (productMatchedBranch) {
                return productMatchedBranch.totalItem
            }
        }
        return 0
    }

    renderModels() {
        return this.state.variations.map( (variation, index) => {
            let tiers_index = variation.tierIndex.split(',');

            let option1 = this.state.tiers[0].options[tiers_index[0]];
            let option2 = tiers_index.length === 2 ? this.state.tiers[1].options[tiers_index[1]] : '';

            return (<tr>
                <td className="td-word__break">
                    {option1} {option2 ? ' - ' + option2 : ''}
                </td>
                <td className="td-top">
                    <AvField 
                        name={"model1"+index} 
                        value={this.state.tiers[0] ? option1 : ''}
                        onBlur={(e, value) => this.onModelValueChange(0, tiers_index[0], value, index)}
                        validate={{
                            required: {value: true, errorMessage: i18next.t("common.validation.required")},
                            maxLength: {value: 20, errorMessage: i18next.t("common.validation.char.max.length", {x: 20})}
                        }}
                    />
                </td>
                {this.isTwoVariants() &&
                <td className="td-top">
                    <AvField 
                        name={"model2"+index} 
                        value={this.state.tiers[1] ? option2 : ''}
                        onBlur={(e, value) => this.onModelValueChange(1, tiers_index[1], value, index)}
                        validate={{
                            required: {value: this.isTwoVariants(), errorMessage: i18next.t("common.validation.required")},
                            maxLength: {value: 20, errorMessage: i18next.t("common.validation.char.max.length", {x: 20})}
                        }}
                    />
                </td>}
                <td className="td-top">
                    <AvField
                        onChange = { (e, value) => this.onFieldChange(index, value, "stock")}
                        name={'productStock' + (index)}
                        value={accounting.formatMoney(variation.totalItem, this.thousandFormat)}
                        validate={{
                            stockValidation : this.stockValidation,
                            maxLength: {value: 12, errorMessage: i18next.t("common.validation.char.max.length", {x: 12})},
                            required: {value: true, errorMessage: i18next.t("common.validation.required")}
                        }}
                        className="gs-atm--disable"
                    />
                </td>
                <td className="price-product td-top">
                    <span className="money-unit">{CurrencySymbol.VND}</span>
                    <AvField
                        onChange = { (e, value) => this.onFieldChange(index, value, "price")}
                        onBlur = {this.checkMaxPriceVariant}
                        value={accounting.formatMoney(variation.newPrice, this.thousandFormat)}
                        name={'productPrice' + (index)}
                        validate={{
                            priceValidation : this.priceValidation,
                            maxLength: {value: 12, errorMessage: i18next.t("common.validation.char.max.length", {x: 12})},
                            required: {value: true, errorMessage: i18next.t("common.validation.required")}
                        }}
                    />
                </td>
                <td className="td-top">
                    <AvField
                        onBlur = { (e, value) => this.onFieldChange(index, value, "sku")}
                        value={variation.sku}
                        name={'variationSku' + (index)}
                        validate={{
                            maxLength: {value: 100, errorMessage: i18next.t("common.validation.char.max.length", {x: 100})},
                        }}
                    />
                </td>
            </tr>)
        })
    }

    render() {
        return (
            <AvForm ref={this.refFrom}>
                {this.state.variations.length > 0 &&
                <table className="shopee-edit-product-variants-table">
                    <tr className="gsa__uppercase gsa__label-08r gsa__color--gray gsa__border-bt--gray gsa__padding-bt--05em">
                        <th>
                            <Trans i18nKey="page.shopee.product.detail.variantsTable.variant"/>
                        </th>
                        <th>
                            <AvField name={"label"+0} value={this.state.tiers[0] ? this.state.tiers[0].name : ''}
                                     onBlur={(e, value) => this.onModelLabelChange(0, value)}
                                     validate={{
                                         duplicateValidation: this.duplicateValidation,
                                         required: {value: true, errorMessage: i18next.t("common.validation.required")},
                                         maxLength: {value: 14, errorMessage: i18next.t("common.validation.char.max.length", {x: 14})}
                                     }}/>
                        </th>
                        {this.isTwoVariants() &&
                        <th>
                            <AvField name={"label"+1} value={this.state.tiers[1] ? this.state.tiers[1].name : ''}
                                     onBlur={(e, value) => this.onModelLabelChange(1, value)}
                                     validate={{
                                        duplicateValidation: this.duplicateValidation,
                                         required: {value: true, errorMessage: i18next.t("common.validation.required")},
                                         maxLength: {value: 14, errorMessage: i18next.t("common.validation.char.max.length", {x: 14})}
                                     }}/>
                        </th>}
                        <th>
                            <Trans i18nKey="page.shopee.product.detail.variantsTable.stock"/>
                        </th>
                        <th>
                            <Trans i18nKey="component.product.addNew.pricingAndInventory.price"/>
                        </th>
                        <th>
                            SKU
                        </th>
                    </tr>
                    {this.renderModels()}
                </table>}

                { this.state.hasError10Time &&
                <AlertInline
                    text={i18next.t('page.shopee.product.edit.max_price.title')}
                    type="error"
                    nonIcon
                />
                }
            </AvForm>
        );
    }
}

ShopeeEditProductVariantsTable_2.propTypes = {
    models: PropTypes.array,
    syncPrice: PropTypes.bool,
    shopeeItem: PropTypes.object,
};

export default ShopeeEditProductVariantsTable_2;
