/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 11/05/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Trans} from "react-i18next";
import './ShopeeEditProductVariantsTable_1.sass';
import {AvField, AvForm} from 'availity-reactstrap-validation';
import i18next from "i18next";
import {Currency, CurrencySymbol} from "../../../../../components/shared/form/CryStrapInput/CryStrapInput";
import Constants from "../../../../../config/Constant";
import accounting from 'accounting-js';
import AlertInline from "../../../../../components/shared/AlertInline/AlertInline";
import {FormValidate} from "../../../../../config/form-validate";
import AvFieldCurrency from "../../../../../components/shared/AvFieldCurrency/AvFieldCurrency";
import {CurrencyUtils} from "../../../../../utils/number-format";

class ShopeeEditProductVariantsTable_1 extends Component {

    constructor(props) {
        super(props);

        this.renderModels = this.renderModels.bind(this);
        this.onModelLabelChange = this.onModelLabelChange.bind(this);
        this.onModelValueChange = this.onModelValueChange.bind(this);
        this.isTwoVariants = this.isTwoVariants.bind(this);
        this.onFieldChange = this.onFieldChange.bind(this);
        this.isInvalidForm = this.isInvalidForm.bind(this);
        this.checkMaxPriceVariant = this.checkMaxPriceVariant.bind(this);
        this.convertDataModel = this.convertDataModel.bind(this);
        this.resolveStockQuantity = this.resolveStockQuantity.bind(this);
        this.convertShopeeVariations = this.convertShopeeVariations.bind(this);

        this.refFrom = React.createRef();

        this.state = {
            variations: [],
            tiers: [],
            hasError10Time : false,
            hasError20Or50V : ''
        }

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
    }


    resolveStockQuantity(model) {
        const currentShop = this.props.shopeeShop
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

    resolveSKU(model) {
        const currentShop = this.props.shopeeShop
        if (currentShop) {
            const {branchId} = currentShop
            const productBranchList = model.branches
            const productMatchedBranch = productBranchList.find(branch => branch.branchId == branchId)
            if (productMatchedBranch) {
                return productMatchedBranch.sku
            }
        }
        return ""
    }

    convertDataModel(){
        let variations = [];
        let tier_variations = [];
        let models = this.props.models;
        let tier_variations_option1 = [];
        let tier_variations_option2 = [];

        // tier
        let tiers_name = models[0].label.split('|');

        models.forEach( model =>{
            let options_name = model.orgName.split('|');
            let option1 = options_name[0];
            let option2 = options_name[1];

            if(tier_variations_option1.findIndex(s => s === option1) === -1){
                // not exist
                tier_variations_option1.push(option1);
            }

            if(tier_variations_option2.findIndex(s => s === option2) === -1){
                    // not exist
                tier_variations_option2.push(option2);
            }

            //--------------------------------//
            // variation
            //--------------------------------//
            let index = [];
            index.push(tier_variations_option1.findIndex(s => s === option1));

            if(tiers_name.length > 1){
                index.push(tier_variations_option2.findIndex(s => s === option2));
            }

            const modelStock = this.resolveStockQuantity(model)
            const modelSKU = this.resolveSKU(model)

            variations.push({
                newPrice : model.newPrice,
                totalItem : modelStock,
                name: model.name,
                sku : modelSKU,
                tierIndex : index.join(','),
                bcModelId: model.id
            });
        });

        //--------------------------------//
        // tier variation
        //--------------------------------//
        tier_variations.push({
            name : tiers_name[0],
            options : tier_variations_option1
        });

        if(tiers_name.length > 1){
            tier_variations.push({
                name : tiers_name[1],
                options : tier_variations_option2
            });
        }

        this.setState({
            variations : variations,
            tiers: tier_variations
        });
    }

    convertShopeeVariations() {
        let variations = [];
        let tier_variations = [];
        let propsVariations = this.props.variations;
        let tier_variations_option1 = [];
        let tier_variations_option2 = [];

        // tier
        let tiers_name = this.props.tierVariations.map(item => item.name);

        propsVariations.forEach(variation => {
            let options_name = variation.name.split(',');
            let option1 = options_name[0];
            let option2 = options_name[1];

            if (tier_variations_option1.findIndex(s => s === option1) === -1) {
                // not exist
                tier_variations_option1.push(option1);
            }

            if (tier_variations_option2.findIndex(s => s === option2) === -1) {
                // not exist
                tier_variations_option2.push(option2);
            }

            //--------------------------------//
            // variation
            //--------------------------------//
            let index = [];
            index.push(tier_variations_option1.findIndex(s => s === option1));

            if (tiers_name.length > 1) {
                index.push(tier_variations_option2.findIndex(s => s === option2));
            }

            variations.push({
                id: variation.shopeeVariationId,
                newPrice: variation.price,
                totalItem: variation.stock,
                name: variation.name,
                sku: variation.sku || null,
                tierIndex: index.join(','),
                bcModelId: variation.id
            });
        });

        //--------------------------------//
        // tier variation
        //--------------------------------//
        tier_variations.push({
            name: tiers_name[0],
            options: tier_variations_option1
        });

        if (tiers_name.length > 1) {
            tier_variations.push({
                name: tiers_name[1],
                options: tier_variations_option2
            });
        }

        this.setState({
            variations: variations,
            tiers: tier_variations
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

        if(this.state.tiers.length === 1 && this.state.variations.length > 50){
            this.setState({hasError20Or50V : i18next.t('page.shopee.product.edit.max_variations.title', { x : 50})})
            return true;
        }else if(this.state.tiers.length === 2 && this.state.variations.length > 50){
            this.setState({hasError20Or50V : i18next.t('page.shopee.product.edit.max_variations.title', { x : 50})})
            return true;
        }

        return this.checkMaxPriceVariant();
    }

    onFieldChange(row, value, name){
        let models = this.state.models;
        let rowData = models[row];

        if(name === "sku"){
            rowData.sku = value;
        }else if(name === "price"){
            let intData = (value + '').split(',').join('');
            rowData.newPrice = intData;
        }else if(name === "stock"){
            let intData = (value + '').split(',').join('');
            rowData.totalItem = intData;
            rowData.soldItem = 0;
        }

        models[row] = rowData;
        this.setState({models : models});
    }

    onFieldChange(row, value, name){
        if (value === undefined)
            return;

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
        if (this.props.isGenuineShopeeProduct) {
            this.convertShopeeVariations();
        }
        else {
        this.convertDataModel();
    }
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
        let varList = [...this.state.variations]

        // map variation id
        if (this.props.variations) {
            for  (const shopeeVar of this.props.variations) {
                const gosellVar = varList.find(gsVar => gsVar.bcModelId === shopeeVar.bcModelId)
                if (gosellVar) {
                    gosellVar.id = shopeeVar.id
                }
            }

            if (!this.props.syncPrice || !this.props.syncStock) {
                for (const variation of varList ) {
                    const orgVar = this.props.variations.find(shopeeVar => shopeeVar.bcModelId === variation.bcModelId)
                    if (orgVar) {
                        // revert stock
                        if (!this.props.syncStock) {
                            variation.totalItem = orgVar.totalItem
                        }

                        // revert price
                        if (!this.props.syncPrice) {

                            variation.newPrice = orgVar.orgPrice
                        }
                    }
                }
            }
        }
        return varList;
    }

    getTiers(){
        return this.state.tiers;
    }

    stockValidation = (value, ctx) => {
        let intData = (value + '').split(',').join('');

        if (isNaN(intData)) {
            let message = i18next.t("common.validation.number.format");
            return message;
        }

        if (parseInt(intData) < Constants.N0 ) {
            let message = i18next.t("common.validation.number.min.value",{
                x: accounting.formatMoney(Constants.N0, this.thousandFormat)
            });
            return message;
        }

        if(parseInt(intData) > Constants.N999_999){
            let message = i18next.t("common.validation.number.max.value",{
                x: accounting.formatMoney(Constants.N999_999, this.thousandFormat)
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

    renderModels() {
        return this.state.variations.map( (variation, index) => {
            let tiers_index = variation.tierIndex.split(',');

            let option1 = this.state.tiers[0].options[tiers_index[0]];
            let option2 = tiers_index.length === 2 ? this.state.tiers[1].options[tiers_index[1]] : '';

            return (<tr>
                <td className="vertical-align-middle">
                    {this.state.tiers[0] ? option1 : ''}
                </td>
                {this.isTwoVariants() &&
                    <td className="vertical-align-middle">
                        {this.state.tiers[1] ? option2 : ''}
                    </td>
                }
                <td className="td-top vertical-align-middle">
                    <AvField
                        onChange = { (e, value) => this.onFieldChange(index, value, "stock")}
                        name={'productStock' + (index)}
                        value={accounting.formatMoney(variation.totalItem, this.thousandFormat)}
                        validate={{
                            stockValidation : this.stockValidation,
                            maxLength: {value: 12, errorMessage: i18next.t("common.validation.char.max.length", {x: 12})},
                            required: {value: true, errorMessage: i18next.t("common.validation.required")}
                        }}
                        className={this.props.enabledStock? "":"gs-atm--disable"}

                    />
                </td>
                <td className="price-product td-top">
                    <AvFieldCurrency
                        name={'productPrice' + (index)}
                        unit={ this.props.currency }
                        value={variation.newPrice}
                        validate={{
                            ...FormValidate.required(),
                            ...FormValidate.maxValue(Constants.VALIDATIONS.PRODUCT.MAX_PRICE, true),
                            ...FormValidate.minValue(0)
                        }}
                        onChange={ (e, value) => this.onFieldChange(index, value, "price")}
                        onBlur={this.checkMaxPriceVariant}
                        position={CurrencyUtils.isPosition(this.props.currency)}
                        precision={CurrencyUtils.isCurrencyInput(this.props.currency) && '2'}
                        decimalScale={CurrencyUtils.isCurrencyInput(this.props.currency) && 2}
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
                    <thead>
                    <tr className="gsa__uppercase gsa__label-08r gsa__color--gray gsa__border-bt--gray gsa__padding-bt--05em">
                        <th>
                            {this.state.tiers[0] ? this.state.tiers[0].name : ''}
                        </th>
                        {this.isTwoVariants() &&
                        <th>
                            {this.state.tiers[1] ? this.state.tiers[1].name : ''}
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
                    </thead>
                    <tbody>
                        {this.renderModels()}
                    </tbody>
                </table>}

                { this.state.hasError10Time &&
                <AlertInline
                    text={i18next.t('page.shopee.product.edit.max_price.title')}
                    type="error"
                    nonIcon
                />
                }
                { this.state.hasError20Or50V &&
                <AlertInline
                    text={i18next.t(this.state.hasError20Or50V)}
                    type="error"
                    nonIcon
                />
                }
            </AvForm>
        );
    }
}

ShopeeEditProductVariantsTable_1.propTypes = {
    models: PropTypes.array, // gosell models
    shopeeShop: PropTypes.object,
    syncPrice: PropTypes.bool,
    variations: PropTypes.array, // shopee variations
    enabledStock: PropTypes.bool,
    syncStock: PropTypes.bool,
    currency: PropTypes.string
};

export default ShopeeEditProductVariantsTable_1;
