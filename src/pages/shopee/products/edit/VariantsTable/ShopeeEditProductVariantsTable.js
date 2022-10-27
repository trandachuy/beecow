/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 11/05/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Trans} from "react-i18next";
import './ShopeeEditProductVariantsTable.sass'
import { AvForm, AvField} from 'availity-reactstrap-validation'
import i18next from "i18next";
import CryStrapInput, {CurrencySymbol} from "../../../../../components/shared/form/CryStrapInput/CryStrapInput";
import Constants from "../../../../../config/Constant";

class ShopeeEditProductVariantsTable extends Component {
    DEFAULT_LABEL = 'Beecow'

    state = {
        models: []
    }

    constructor(props) {
        super(props);

        this.renderLabels = this.renderLabels.bind(this);
        this.renderModels = this.renderModels.bind(this);
        this.onModelLabelChange = this.onModelLabelChange.bind(this);
        this.onModelValueChange = this.onModelValueChange.bind(this);
        this.isTwoVariants = this.isTwoVariants.bind(this);
        this.getModelDetail = this.getModelDetail.bind(this);
        this.onFormChange = this.onFormChange.bind(this);
    }

    onFormChange(row, value){

        if(!value){
            value = null;
        }
        
        let models = this.state.models;

        let rowData = models[row];
        rowData.sku = value;

        models[row] = rowData;

        this.setState({models : models});
    }

    componentDidMount() {
        // check label missing
        let models = this.props.models
        if (!models[0].label) {
            for (let model of models) {
                model.label = this.DEFAULT_LABEL
            }
        }

        this.setState({
            models: models
        })
    }

    onModelValueChange(rowIndex, colIndex, value) {

        // // just have one variant
        // if (colIndex === 1 && !this.isTwoVariants()) {
        //     return
        // }

        let models = this.state.models
        // if (models[0].label.split('|').length === 2) { // 2 label
        let tempRow = models[rowIndex]
        let orgName = tempRow.orgName.split('|')
        orgName[colIndex] = value
        tempRow.orgName = orgName.join('|')
        tempRow.name = orgName.join(' ')


        this.setState({
            models: models
        })
    }

    onModelLabelChange(colIndex, value) {
        let models = this.state.models
        let newModels = []
        let tempLabel = models[0].label.split('|')
        tempLabel[colIndex] = value
        tempLabel = tempLabel.join('|')
        for (let model of models) {
            model.label = tempLabel
            newModels.push(model)
        }

        this.setState({
            models: newModels
        })
    }


    renderLabels() {
        let labelsArr = this.state.models[0].label.split('|')
        return labelsArr.map( (label, index) => (
            <th key={index} onBlur={this.onModelValueChange}>
                <AvField name={"label"+index} value={label? label:''}
                         onBlur={(e, value) => this.onModelLabelChange(index, value)}
                         validate={{
                             required: {value: true, errorMessage: i18next.t("common.validation.required")},
                             maxLength: {value: 14, errorMessage: i18next.t("common.validation.number.max.value", {x: 14})}
                         }}/>
            </th>)
        )
    }

    isTwoVariants() {
        return this.state.models[0].label.split('|').length > 1
    }

    getModelDetail(){
        return this.state.models;
    }

    renderModels() {
        return this.state.models.map( (variation, index) => {
            const values = variation.orgName.split('|')
            return (<tr>
                <td>
                    {variation.orgName.split('|').join(' - ')}
                </td>
                <td>
                    <AvField name={"model1"+index} value={values[0]}
                             onBlur={(e, value) => this.onModelValueChange(index, 0,  value)}
                             validate={{
                                 required: {value: true, errorMessage: i18next.t("common.validation.required")},
                                 maxLength: {value: 20, errorMessage: i18next.t("common.validation.number.max.value", {x: 20})}
                             }}/>
                </td>
                {this.isTwoVariants() &&
                <td>
                    <AvField name={"model2"+index} value={values[1]? values[1]:''}
                             onBlur={(e, value) => this.onModelValueChange(index, 1, value)}
                             validate={{
                                 required: {value: this.isTwoVariants(), errorMessage: i18next.t("common.validation.required")},
                                 maxLength: {value: 20, errorMessage: i18next.t("common.validation.number.max.value", {x: 20})}
                             }}/>
                </td>}
                <td>
                    <CryStrapInput
                        precision={0}
                        default_value={variation.totalItem - variation.soldItem}
                        min_value={0}
                        max_value={Constants.N100_000}
                    />
                </td>
                <td>
                    <CryStrapInput
                        precision={0}
                        default_value={variation.newPrice}
                        name={'productPrice'}
                        thousandSeparator=","
                        unit={CurrencySymbol.VND}
                        min_value={Constants.N10_000}
                        max_value={Constants.N100_000_000}
                    />
                </td>
                <td>
                    <AvField
                        onChange = { (e, value) => this.onFormChange(index, value)}
                        value={variation.sku}
                        name={'variationSku'}
                        validate={{
                            maxLength: {value: 100, errorMessage: i18next.t("common.validation.number.max.value", {x: 100})}
                        }}/>
                </td>
            </tr>)
        })
    }

    render() {
        let labels = 'Beecow'
        labels = this.state.models[0] && this.state.models[0].label? this.state.models[0].label.split('|'):null
        return (
            <AvForm>
                {this.state.models.length > 0 &&
                <table className="shopee-edit-product-variants-table">
                    <tr className="gsa__uppercase gsa__label-08r gsa__color--gray gsa__border-bt--gray gsa__padding-bt--05em">
                        <th>
                            <Trans i18nKey="page.shopee.product.detail.variantsTable.variant"/>
                        </th>
                        <th>
                            <AvField name={"label"+0} value={labels[0]? labels[0]:'Beecow'}
                                     onBlur={(e, value) => this.onModelLabelChange(0, value)}
                                     validate={{
                                         required: {value: true, errorMessage: i18next.t("common.validation.required")},
                                         maxLength: {value: 14, errorMessage: i18next.t("common.validation.number.max.value", {x: 14})}
                                     }}/>
                        </th>
                        {this.isTwoVariants() &&
                        <th>
                            <AvField name={"label"+1} value={labels[1]? labels[1]:''}
                                     onBlur={(e, value) => this.onModelLabelChange(1, value)}
                                     validate={{
                                         required: {value: true, errorMessage: i18next.t("common.validation.required")},
                                         maxLength: {value: 14, errorMessage: i18next.t("common.validation.number.max.value", {x: 14})}
                                     }}/>
                        </th>}
                        <th>
                            <Trans i18nKey="page.shopee.product.detail.variantsTable.stock"/>
                        </th>
                        <th>
                            <Trans i18nKey="page.shopee.product.detail.variantsTable.price"/>
                        </th>
                        <th>
                            SKU
                        </th>
                    </tr>
                    {this.renderModels()}
                </table>}
            </AvForm>
        );
    }
}

ShopeeEditProductVariantsTable.propTypes = {
    models: PropTypes.array
};

export default ShopeeEditProductVariantsTable;
