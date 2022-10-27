import React from 'react';
import {
    UikButton,
    UikCheckbox,
    UikContentTitle,
    UikHeadlineDesc,
    UikWidget,
    UikWidgetContent,
    UikWidgetHeader,
    UikWidgetTable
} from '../../../../@uik';
import {Link} from "react-router-dom";
import './LazadaEditProduct.sass';
import GSContentContainer from "../../../../components/layout/contentContainer/GSContentContainer";
import GSContentHeader from "../../../../components/layout/contentHeader/GSContentHeader";
import {Trans} from "react-i18next";
import {Breadcrumb, BreadcrumbItem, Dropdown, DropdownItem, DropdownMenu, DropdownToggle} from 'reactstrap';
import GSContentBody from "../../../../components/layout/contentBody/GSContentBody";

import {AvField, AvForm, AvRadio, AvRadioGroup} from 'availity-reactstrap-validation';
import Label from "reactstrap/es/Label";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import i18next from "../../../../config/i18n";
import {lazadaService} from '../../../../services/LazadaService';
import DropdownTree from '../../../../components/shared/DropdownTree/DropdownTree';
import {connect} from "react-redux";
import categories from "../../../../../public/data/categories.json";
import {RouteUtils} from "../../../../utils/route";
import {NAV_PATH} from "../../../../components/layout/navigation/Navigation";
import {CredentialUtils} from "../../../../utils/credential";
import LazadaImageModal from "../../../../components/shared/LazadaImageModal/LazadaImageModal";


class LazadaEditProduct extends React.Component {
    constructor(props) {
        super(props);
        this.multipleSelectProps = {};
        this.groupMultipleSelect = {};
        this.state = {
            lzAccessToken: CredentialUtils.getLazadaToken(),
            itemId: props.match.params.itemId,
            channel: props.match.params.channel,
            product: props.location.state ? props.location.state.product : undefined,
            isValidImageAmount: true,
            isSaving: false,
            productImages: [],
            shippingInfo: {},
            categories: categories,
            attributes: [],
            varLength: 0,
            skuAttribtues: new Map(),
            normalAttribtues: new Map(),
            skuRequired: new Map(),
            skuIsSaleRequired: new Map(),
            normalRequired: new Map(),
            offerAttributes: new Map(),
            packageAttributes: new Map(),
            storeId: CredentialUtils.getStoreId(),
            sellerId : CredentialUtils.getLazadaStoreId(),
            multipleSelectProps: {},
            dropdownOpen: false
        }
       
        this.hashTag = this.hashTag.bind(this);
        this.onValidSubmit = this.onValidSubmit.bind(this);
        this.toggle = this.toggle.bind(this);
        this.uploadImage = this.uploadImage.bind(this);
    }

    UNSAFE_componentWillMount(){
        this.isLazadaAuthorized();
        this.fetchProductById(this.state.itemId);
    }

    componentDidUpdate(props, state){
        state.multipleSelectProps = this.multipleSelectProps;
    }
 
    toggle(attributeName) {
        if(!this.state.dropdownOpen && !this.groupMultipleSelect[attributeName]){
            this.groupMultipleSelect[attributeName] = true;
            this.setState({dropdownOpen: true});
        }
        else if(this.state.dropdownOpen && this.groupMultipleSelect[attributeName]){
            this.groupMultipleSelect[attributeName] = false;
            this.setState({dropdownOpen: false});
        }
        
    }
    onSelectCategory(categoryId){
    }
    isLazadaAuthorized = () => {
        if(!this.state.lzAccessToken && !this.state.sellerId){
            lazadaService.getAccountByBcStoreId(this.state.storeId).then(res =>{
                if(!res.sellerId){
                    return RouteUtils.linkTo(this.props, NAV_PATH.lazadaAccount);
                }
                this.setState({lzAccessToken: res.accessToken});
                this.setState({sellerId: res.sellerId});
            }, error =>  RouteUtils.linkTo(this.props, NAV_PATH.lazadaAccount));
        }else if(this.state.lzAccessToken && !this.state.sellerId){
            return RouteUtils.linkTo(this.props, NAV_PATH.lazadaAccount);
        }
    }
    
    isPackageAttributes(attr){
        return (attr.name === "package_content"
                    || attr.name === "package_weight" 
                    || attr.name === "package_length" 
                    || attr.name === "package_width"
                    || attr.name === "package_height");
    }
    isOfferAttributes(attr){
        return (attr.name === "product_warranty"
                    || attr.name === "warranty_type"
                    || attr.name === "warranty"
                    || attr.name === "delivery_option_standard"
                    || attr.name === "delivery_option_express"
                    || attr.name === "delivery_option_economy"
                    || attr.name === "Hazmat"
                    || attr.name === "description" );
    }
    getCategoryAttributes(categoryId) {
        let self = this;
        lazadaService.getCategoryAttributes(categoryId, { "accessToken": this.state.lzAccessToken }).then(res => {
            self.setState({ attributes: res });
            let skuAttribtues = new Map();
            let normalAttribtues = new Map();
            let skuRequired = new Map();
            let skuIsSaleRequired = new Map();
            let normalRequired = new Map();
            let offerAttributes = new Map();
            let packageAttributes = new Map();
            res.map(attr => {
                if (attr.attributeType === 'sku') {
                    if (this.isPackageAttributes(attr))
                        packageAttributes.set(attr.name, attr);
                    else if(attr.isMandatory === 1 && attr.isSaleProp === 1){
                        skuIsSaleRequired.set(attr.name, attr);
                    }else if (attr.isMandatory === 1) {
                        skuRequired.set(attr.name, attr);
                    }
                    else {
                        if(attr.name === "quantity" )
                            skuRequired.set(attr.name, attr);
                        else skuAttribtues.set(attr.name, attr);
                    }
                }
                else if (attr.attributeType === 'normal') {
                    if (attr.isMandatory === 1){
                        normalRequired.set(attr.name, attr);
                    }
                    else if(this.isOfferAttributes(attr)){
                        offerAttributes.set(attr.name, attr);
                    }
                    else normalAttribtues.set(attr.name, attr);
                }
            });

            self.setState({
                skuAttribtues: skuAttribtues,
                normalAttribtues: normalAttribtues,
                skuRequired: skuRequired,
                skuIsSaleRequired: skuIsSaleRequired,
                normalRequired: normalRequired,
                offerAttributes: offerAttributes,
                packageAttributes: packageAttributes            
            });
        })
    }
    
    fetchProductById(productId) {
        let self = this;
        if (self.state.product) {
            self.setState({
                productImages: self.state.product.models[0].Images
            });
            self.getCategoryAttributes(self.state.product.categoryId);
        } else {
            return lazadaService.getProductById(productId).then(res => {
                self.setState({product: res});
                self.getCategoryAttributes(res.categoryId);
            })
        }
    }

    defaultValue(key) {
        return this.state.product.attributes[key];
    }

    defaultValueWithParent(parent, key, defaultV) {
        if (!this.props.item) return defaultV;
        return this.props.item[parent][key];
    };

    hashTag = (attributeName) =>{
        let propertyValue = this.multipleSelectProps[attributeName];
        return propertyValue ? propertyValue.split(",") : [];
    }

    onMultiSelectChange = ($event, attributeName, value) => {
        $event.stopPropagation();
        let propertyValue = this.multipleSelectProps[attributeName];
        let values = propertyValue ? propertyValue.split(",") : [];
        let index = values.indexOf(value);
        if(index < 0)
            values.push(value);
        else
            values.splice(index, 1);
        this.multipleSelectProps[attributeName] = values.join(",");
        this.setState({multipleSelectProps: this.multipleSelectProps});
    }

    isOpenMultiSelect(attributeName){
        return this.state.dropdownOpen && this.groupMultipleSelect[attributeName];
    }
    renderMultipleSelect(attr, attrValue, index){
        const attributeName = this.createAttributeName(attr, index);
        this.createPropsByMultipleSelect(attributeName, attrValue);
        this.createGroupMultipSelect(attributeName);
        return (
            <UikWidget id={attr.name} className="position-relative">
                <Dropdown key={attr.name} isOpen={this.isOpenMultiSelect(attributeName)} toggle={() => this.toggle(attributeName)}>
                    <DropdownToggle key={attributeName} className="var-values__pool">
                    {this.hashTag(attributeName).map((item, index) => {
                            return(
                                <div key={index} className="var-values__varItem">
                                    {item}
                                    <a className="var-values__btn-remove"
                                        onClick={(e) => {this.onMultiSelectChange(e, attributeName, item)}}>
                                        <FontAwesomeIcon icon="times-circle"></FontAwesomeIcon>
                                    </a>
                                </div>)
                        })}
                    </DropdownToggle>
                         <DropdownMenu className="multiple-select">
                            {attr.options.map((item, index)=>{
                                    return (
                                    <DropdownItem
                                        key={index}
                                        className="select-item"
                                        toggle={false}
                                        onClick={(e)=>this.onMultiSelectChange(e, attributeName, item.name)}>
                                        {this.hashTag(attributeName).includes(item.name) && (<span>&#10003;</span>)}
                                        <span>{item.name}</span></DropdownItem>)})}      
                                    
                        </DropdownMenu>
                </Dropdown>
            </UikWidget>
        );
    }

    renderCheckboxGroup(attr, attrValue, index){
        let self = this;
        const defaultVal = attrValue ? attrValue.split(",") : new Array();
        const options = attr.options.map(item => item.name);
        let attributeName = this.createAttributeName(attr, index);
        this.createPropsByMultipleSelect(attributeName, attrValue);
        return (
            <UikWidget>
                {options.map((item, index) => {
                        return (
                            <UikCheckbox
                                key={index}
                                name={attributeName}
                                label={item}
                                onChange={(e)=>self.onMultiSelectChange(e, attributeName, item)}
                                color="blue"
                                defaultChecked = {defaultVal.includes(item)}/>
                        );})
                }
            </UikWidget>
        );
    };
    renderSingleSelect(attr, attrValue, index){
        return (
            <AvField type="select" name={this.createAttributeName(attr, index)} value={attrValue}>
                <option label="" value="" />
                {attr.options.map((item, index) => {
                    return (<option key={index} value={item.name}>{item.name}</option>)})}
            </AvField>
        );
    }
    renderRadioButton(attr, attrValue, index){
        return (
            <AvRadioGroup inline name={this.createAttributeName(attr, index)} defaultValue={attrValue}>
                {attr.options.map((item, index) => {
                    return (<AvRadio key={index} customInput label={item.name} value={item.name} />)
                })}
            </AvRadioGroup>
        );
    }
    renderText(attr, attrValue, index){
        return (
            <AvField name={this.createAttributeName(attr, index)} value={attrValue} required={attr.isMandatory === 1}/>
        )
    }
    renderNumberic(attr, attrValue, index){
        return (
            <AvField name={this.createAttributeName(attr, index)} type={"numberic"} value={attrValue}
                onKeyPress={this.props.onKeyPress ? this.props.onKeyPress : null}
                validate={{
                    ...this.props.validate,
                    required: {
                        value: attr.isMandatory === 1
                    }
                }} />
        );
    }
    onRichTextChange(){

    }

  _onBoldClick() {
    this.onChange(RichUtils.toggleInlineStyle(this.state.editorState, 'BOLD'));
  }
    renderRichText(attr, attrValue, index){
      
        return (
            
            <div></div>
            // <AvField name={this.createAttributeName(attr, index)} type={"textarea"} value={attrValue}
            //     onKeyPress={this.props.onKeyPress ? this.props.onKeyPress : null}
            //     validate={{
            //         ...this.props.validate,
            //         required: {value: attr.isMandatory === 1,
            //             errorMessage: i18next.t("common.validation.required")
            //         },
            //         minLength: {value: 1,
            //             errorMessage: i18next.t("common.validation.char.min.length", {x: this.props.minLength})},
            //         maxLength: {value: 2000,
            //             errorMessage: i18next.t("common.validation.char.max.length", {x: this.props.maxLength})}
            //     }} />
                
                );
    }

    renderImages(attr, attrValue, index){
        let attributeName = this.createAttributeName(attr, index);
        this.createPropsByMultipleSelect(attributeName, attrValue);
        return (
            <section className="selected-product"  onClick={()=>this.openImageModal(attributeName, this.multipleSelectProps[attributeName])}>
                {this.multipleSelectProps[attributeName][0] ? <img name={attributeName} src={this.multipleSelectProps[attributeName][0]}/> : "No Image"}
            </section>
            )
    }
    uploadImage(files){
        return lazadaService.uploadImage({"accessToken": this.state.lzAccessToken}, files);
    }

    openImageModal(attributeName, attrValue){
        let self = this;
        self.refImageModal.openModal({
            messages: i18next.t('component.product.addNew.cancelHint'),
            prodImageList: attrValue.filter(img => {
                if(img){return img}
            }).map(img =>  {return {o9n: 1, image:img}}),
            okCallback: (prodImageList) => {
                const files = prodImageList.filter(img => {
                    if(img.rawFile) return img.rawFile; 
                });
                self.multipleSelectProps[attributeName] = [...self.multipleSelectProps[attributeName], ...res];
                // self.uploadImage(files).then(res => {
                //     , 
                // });
                // this.setState({
                //     onRedirect: true
                // })
            }
        })
        
    }
    getAttribute(attributes, name, attributesValue, index) {
        const attr = attributes.get(name);
        if (attr) {
            switch (attr.inputType) {
                case "text":
                    if (name === "name") {
                        attributes.delete(name);
                        const priceRange = attributesValue.map(model => model.price);
                        const minPrice = Math.min.apply(null, priceRange);
                        const maxPrice = attributesValue.length > 1 ?  Math.max.apply(null, priceRange): null;
                        return (
                            <UikWidget>
                                <section className="selected-product">
                                    {attributesValue[0].Images[0] ? <img src={attributesValue[0].Images[0]} /> : "No Image"}
                                    <span>
                                        <label name={this.createAttributeName(attr, index)}>{this.state.product.name}</label>
                                        <p>{+ "" + minPrice + "" + (maxPrice ? " ~ " + maxPrice : "")}</p>
                                    </span>
                                </section>
                            </UikWidget>)
                    }
                    return this.renderText(attr, attributesValue[name], index);
                case "richText":
                    return this.renderRichText(attr, attributesValue[name], index);
                case "multiSelect":
                    if(attr.options.length > 5)
                        return this.renderMultipleSelect(attr, attributesValue[name], index);
                    return this.renderCheckboxGroup(attr, attributesValue[name], index);
                case "multiEnumInput":
                    return this.renderSingleSelect(attr, attributesValue[name], index);
                case "singleSelect":
                    if(attr.name === "brand"){
                        if(attr.options.length === 0)
                            attr.options.push({name: attributesValue[name]});
                        return this.renderSingleSelect(attr, attributesValue[name], index);
                    }
                    else if(attr.options.length > 5)
                        return this.renderSingleSelect(attr, attributesValue[name], index);
                    return this.renderRadioButton(attr, attributesValue[name], index);
                case "numeric":
                    return this.renderNumberic(attr, attributesValue[name], index);
                case "img":
                    return this.renderImages(attr, attributesValue["Images"], index);
                default: 
                    break;
                }
        }
    }
    onValidSubmit = (event, values) => {
        const normalProperties = values["normal"];
        const skuProperties = values["sku"];
        const attributes = this.state.product["attributes"];
        const models = this.state.product["models"];
        const packageAttributes = values["package"];
        let skuMultiSelect={};
        let normalMultiSelect={};
        Object.keys(this.multipleSelectProps).map(key => {
            const keys= key.split(".");
            if(this.isSkuAttribute(keys[0])){
                skuMultiSelect[keys[1]] = this.multipleSelectProps[key] ? this.multipleSelectProps[key] : ",";
            }else{
                normalMultiSelect[keys[1]] = this.multipleSelectProps[key] ? this.multipleSelectProps[key] : ",";
            }
        })
        
        Object.keys(normalProperties).map((key)=>{
            const formValue = normalProperties[key];
            const value = attributes[key];

            if((value && formValue) && (value !== formValue)){
                attributes[key] = formValue;
            }else if(value && !formValue){
                attributes[key] = formValue;
            }
            else if(!value && formValue){
                attributes[key] = formValue;
            }
        });
        Object.keys(normalMultiSelect).map(key =>{
            attributes[key] = normalMultiSelect[key];
        })

        Object.keys(skuProperties).map((key) => {
            const sku = skuProperties[key];
            const model = models[key];
            Object.keys(sku).map((nestedKey) =>{
                const formValue = sku[nestedKey];
                const value = model[nestedKey];

                if((value && formValue) && (value !== formValue)){
                    model[nestedKey] = formValue;
                }else if(value && !formValue){
                    model[nestedKey] = formValue;
                }
                else if(!value && formValue){
                    model[nestedKey] = formValue;
                }
            });
            Object.keys(packageAttributes).map((key) => {
                model[key] = packageAttributes[key];
            })
            Object.keys(skuMultiSelect).map(key => {
                model[key] = skuMultiSelect[key];
            })
            models[key] = model;
        })

        this.state.product.attributes = attributes;
        this.state.product.models = models;
        // lazadaService.syncProduct({"accessToken": this.state.lzAccessToken}, this.state.product).then(res =>{
        //     console.log(res);
        // })
        this.setState({product: this.state.product});
    };

    isSkuAttribute(attributeType){
        return attributeType === 'sku' || attributeType.includes('sku');
    }

    createAttributeName(attr, index){
        if(this.isPackageAttributes(attr))
            return "package" + "." + attr.name;
        if(this.isSkuAttribute(attr.attributeType))
            return attr.attributeType +  "[" + index +"]." + attr.name;
        return attr.attributeType +  "." + attr.name;
    }

    createPropsByMultipleSelect(attributeName, value){
        if(this.multipleSelectProps[attributeName] === undefined){
            if(attributeName.includes("image")){
                return this.multipleSelectProps[attributeName] = value;
            }
            return this.multipleSelectProps[attributeName] = value ? value.split(",")[0] ? value : "": "";
        }
    }
    createGroupMultipSelect(attributeName){
        if(this.groupMultipleSelect[attributeName] === undefined){
            return this.groupMultipleSelect[attributeName] = false;
        }
    }
    render() {
        let self = this;
        if(this.state.product){
            return (
                <GSContentContainer className="lazada-product-container">
                    <GSContentBody size={GSContentBody.size.MAX}>
                        <AvForm onValidSubmit={this.onValidSubmit}>
                            <GSContentHeader>
                                <Breadcrumb>
                                    <BreadcrumbItem>Lazada</BreadcrumbItem>
                                    <BreadcrumbItem>Create Listing</BreadcrumbItem>
                                </Breadcrumb>
                            
                                <UikButton success className="btn-cancel" Component={Link} to="/channel/lazada/product">
                                    <Trans i18nKey="common.btn.cancel" className="sr-only">
                                        Cancel
                                    </Trans>
                                </UikButton>
                                <UikButton success type="submit" className="btn-save">
                                    <Trans i18nKey="common.btn.create" className="sr-only">
                                        Create
                                    </Trans>
                                </UikButton>
                            </GSContentHeader>
                        
                                <UikWidget className="gs-widget">
                                    <UikWidgetHeader>
                                        <Label>
                                            Listing Detail
                                        </Label>
                                        <UikHeadlineDesc>
                                            Verify or edit product details you want to create or sync on Lazada
                                    </UikHeadlineDesc>
                                    </UikWidgetHeader>
                                
                                    <UikWidgetContent>
                                            <Label>Selected Product</Label>
                                            {this.getAttribute(this.state.normalRequired, "name", this.state.product.models)}
    
                                            <UikContentTitle>Categories</UikContentTitle>
                                            <DropdownTree onSelectCategory={this.onSelectCategory} categories={this.state.categories} categoryId={this.state.product.categoryId}></DropdownTree>
                                            {
                                                this.state.normalRequired.size > 0 && Array.from(this.state.normalRequired.values()).map((item, index) => {
                                                    return (
                                                        <UikWidget key={index}>
                                                            <UikContentTitle>{item.label}</UikContentTitle>
                                                            {this.getAttribute(this.state.normalRequired, item.name, this.state.product.attributes)}
                                                        </UikWidget>)
                                                })
                                                }
                                            <UikWidget>
                                                <Label>Product Attributes</Label>
                                                {
                                                    this.state.offerAttributes.size > 0 && Array.from(this.state.offerAttributes.values()).map((item, index) => {
                                                        return (
                                                            <UikWidget key={index}>
                                                                <UikContentTitle>{item.label}</UikContentTitle>
                                                                {this.getAttribute(this.state.offerAttributes, item.name, this.state.product.attributes)}
                                                            </UikWidget>)
                                                    })
                                                }
    
                                                {
                                                    this.state.packageAttributes.size > 0 && Array.from(this.state.packageAttributes.values()).map((item, index) => {
                                                        return (
                                                            <UikWidget key={index}>
                                                                <UikContentTitle>{item.label}</UikContentTitle>
                                                                {this.getAttribute(this.state.packageAttributes, item.name, this.state.product.models[0])}
                                                            </UikWidget>)
                                                    })
                                                }
                                                <UikWidget>
                                                    <FontAwesomeIcon icon="angle-down" className="storefront-view" />
                                                    <Label>Optimize Sales with Attribues</Label>
                                                </UikWidget>
                                                <UikWidget>
                                                    {this.state.normalAttribtues.size > 0 && Array.from(this.state.normalAttribtues.values()).map((item, index) => {
                                                        return (
                                                            <UikWidget key={index}>
                                                                <UikContentTitle>{item.label}</UikContentTitle>
                                                                {this.getAttribute(this.state.normalAttribtues, item.name, this.state.product.attributes)}
                                                            </UikWidget>
                                                        )
                                                    })}
                                                    </UikWidget>
                                            </UikWidget>
                                    </UikWidgetContent>
    
                                </UikWidget>
                                { /** Product Variation */}
                                <UikWidget className="gs-widget">
                                    <UikWidgetHeader>
                                        <Label>Product Variations</Label>
                                        <UikHeadlineDesc>
                                            Chooose variations that will appearon Lazada Platform
                                        </UikHeadlineDesc>
                                    </UikWidgetHeader>
    
                                    <UikWidgetContent>
                                            <UikWidgetTable>
                                                <thead>
                                                    <tr>
                                                        <th><Label>Images</Label></th>
                                                        {this.state.skuIsSaleRequired.size > 0 && Array.from(this.state.skuIsSaleRequired.values()).map((item, index) => {
                                                            return (<th key={index}><Label>{item.name}</Label></th>)
                                                        })}
                                                        {this.state.skuRequired.size > 0 && Array.from(this.state.skuRequired.values()).map((item, index) => {
                                                            return (<th key={index}><Label>{item.name}</Label></th>)
                                                        })}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {this.state.product.models.map((model, index) => {
                                                        return (
                                                            <tr key={index}>
                                                                <td>{this.getAttribute(this.state.skuAttribtues, "__images__", model, index)}</td>
                                                                {this.state.skuIsSaleRequired.size > 0 && Array.from(this.state.skuIsSaleRequired.values()).map((item, secondIndex) => {
                                                                    return (<td key={secondIndex}>{this.getAttribute(this.state.skuIsSaleRequired, item.name, model, index)}</td>)
                                                                })}
                                                                {this.state.skuRequired.size > 0 && Array.from(this.state.skuRequired.values()).map((item, thirdIndex) => {
                                                                    return (<td key={thirdIndex}>{this.getAttribute(this.state.skuRequired, item.name, model, index)}</td>)
                                                                })}
                                                            </tr>)
                                                    })}
                                                </tbody>
                                            </UikWidgetTable>
                                    </UikWidgetContent>
                                </UikWidget>
                        </AvForm>
                    </GSContentBody>
                    <LazadaImageModal ref={(el) => { this.refImageModal = el }} uploadImage={this.uploadImage} />
                </GSContentContainer>
            );
        }
        else{
            return (
                <h1>Syncing.......................</h1>
            )
        }
        
    }
}




export default connect()(LazadaEditProduct);
