/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 29/08/2019
 * Author: Tien Dao <tien.dao@mediastep.com>
 *******************************************************************************/
import React from 'react';
import PropTypes from 'prop-types';
import GSWidget from "../form/GSWidget/GSWidget";
import GSWidgetHeader from "../form/GSWidget/GSWidgetHeader";
import GSWidgetContent from "../form/GSWidget/GSWidgetContent";
import './ThemeComponent.sass'
import DropDownCollectionItem from "./shared/DropDownCollectionItem/DropDownCollectionItem"
import DropDownMenuItem from "./shared/DropDownMenuItem/DropDownMenuItem"
import ImageUploadItem from "./shared/ImageUploadItem/ImageUploadItem"
import LinkToItem from "./shared/LinkToItem/LinkToItem"
import TextItem from "./shared/TextItem/TextItem"
import TextAreaItem from "./shared/TextAreaItem/TextAreaItem"
import Label from "reactstrap/es/Label";
import {Trans} from "react-i18next";

export default class ThemeComponent extends React.Component {

    ItemType = {
        TEXT : "TEXT",
        TEXTAREA : "TEXTAREA",
        UPLOAD: "UPLOAD",
        DROPDOWN_COLLECTION: "DROPDOWN_COLLECTION",
        MODAL_PRODUCT: "MODAL_PRODUCT",
        HREF_MODAL_PRODUCT: "HREF_MODAL_PRODUCT",
        HREF_DROPDOWN_COLLECTION: "HREF_DROPDOWN_COLLECTION",
        HREF_PAGE: "HREF_PAGE",
        HREF_MULTIPLE: "HREF_MULTIPLE",
        DROPDOWN_MENU: "DROPDOWN_MENU"
    }

    state = {
        componentId: this.props.data.id,
        title: this.props.data.component_title,
        image: this.props.data.component_image,
        file: undefined,
        description: this.props.data.component_description,
        schemaGroup: this.props.data.schema,
        order: this.props.data.order,
        isRequiredTitle: this.props.data.is_required_title ? true : false,
        isRequiredImage: this.props.data.is_required_image ? true : false,
   
        isShowMore : false,
        lstCollapse: [],  

        itemType: 
        (!this.props.itemType || this.props.itemType === 'ALL') ? null 
        : this.props.itemType === 'PRODUCT' ? 'BUSINESS_PRODUCT'
        : this.props.itemType === 'SERVICE' ? 'SERVICE'
        : null
    }

    constructor(props) {
        super(props);

        this.lstRef = []

        this.returnData = {
            id: this.props.data.id,
            schema: [],
            component_title: '',
            order: undefined
        }

        this.toggleShowMore = this.toggleShowMore.bind(this)
        this.componentValidation = this.componentValidation.bind(this)
        this.componentReturnData = this.componentReturnData.bind(this)
        this.callBackOfText = this.callBackOfText.bind(this)
        this.callBackOfUpload = this.callBackOfUpload.bind(this)
        this.renderInputType = this.renderInputType.bind(this)
        this.toggleGroup = this.toggleGroup.bind(this)
        this.getComponentName = this.getComponentName.bind(this)
        this.getComponentImage = this.getComponentImage.bind(this)
        this.renderSupportedDevices = this.renderSupportedDevices.bind(this);
    }

    componentDidMount(){
    }

    toggleGroup(index){
        let lstCollapse = this.state.lstCollapse
        lstCollapse[index] = lstCollapse[index] ? false : true
        this.setState({lstCollapse : lstCollapse})
    }

    toggleShowMore() {
        this.setState(pre => ({
            isShowMore:  !pre.isShowMore
        }))
    }

    getComponentName(indexGroup, indexSchema, value){
        this.setState({title: value})
    }

    getComponentImage(indexGroup, indexSchema, file){
        if(!file){
            // undefined
            this.setState({file: undefined, image: ''})
        }else if(file.isFile){
            this.setState({file: file.file, image: ''})
        }else{
            this.setState({image: file.file})
        }
    }

    callBackOfText(indexGroup, indexSchema, value){
        let dataTemp = this.state.schemaGroup
        dataTemp[indexGroup][indexSchema].value = value
        this.setState({schemaGroup : dataTemp})
    }

    callBackOfUpload(indexGroup, indexSchema, file){
        let dataTemp = this.state.schemaGroup

        if(!file || file.isFile === true){
            // undefine or has file
            dataTemp[indexGroup][indexSchema].file = (file && file.isFile) ? file.file : undefined
        }else{
            dataTemp[indexGroup][indexSchema].value = file.file
        }
        this.setState({schemaGroup : dataTemp})
    }

    componentValidation(){
        let newRef
        let hasError = false
        let errorGroup = []

        // do not check if this component is disable
        if(!this.props.hasFeature){
            return true;
        }

        // validate title
        if(this.state.isRequiredTitle){
            newRef = this.titleRef.current ? this.titleRef.current : this.titleRef
            if(!newRef.isValid()){
                hasError = true
            }
        }
        
        // validate image
        if(this.state.isRequiredImage){
            newRef = this.imageRef.current ? this.imageRef.current : this.imageRef
            if(!newRef.isValid()){
                hasError = true
            }
        }

        // validate list schema of component
        this.lstRef.forEach(ref => {
            newRef = ref.current ? ref.current : ref
            if(newRef.isValid() === false){
                hasError = true

                let indexGroup = newRef.props.indexGroup
                if(!errorGroup.includes(indexGroup)){
                    errorGroup.push(indexGroup)
                }
            }
        })

        if(hasError){
            // show componet
            if(!this.state.isShowMore){
                this.toggleShowMore()
            }

            // show group error
            errorGroup.forEach(group =>{
                if(!this.state.lstCollapse[group]){
                    this.toggleGroup(group)
                }
            })

        }

        return !hasError
    }

    componentReturnData(){
        let lstFile = []
        let newLstGroup = []

        this.state.schemaGroup.forEach((group, indexGroup) => {
            let newGroup = []
            group.forEach((schema, indexSchema) =>{
                newGroup.push({
                    id: schema.id, 
                    value: schema.value
                })

                if(schema.file){
                    lstFile.push({
                        comId: this.returnData.id, 
                        indexGroup: indexGroup, 
                        indexSchema: indexSchema, 
                        file: schema.file,
                        order: this.state.order
                    })
                }
            })
            newLstGroup.push(newGroup)
        })

        // set return data
        this.returnData.schema = newLstGroup
        this.returnData.component_title = this.state.title
        this.returnData.component_image = this.state.image
        this.returnData.order = this.state.order

        // incase component has background image
        if(this.state.file){
            lstFile.push({
                comId: this.returnData.id, 
                indexGroup: -1, 
                indexSchema: -1, 
                file: this.state.file,
                order: this.state.order
            })
        }
        
        return {
            data: this.returnData, 
            lstFile: lstFile
        }
    }

    renderSupportedDevices() {
        return (
            <div className="device-wrapper">
                {this.props.data.preview_web &&
                <img alt="desktop"
                     className="device-icon"
                     src="/assets/images/theme/icon-website.svg"
                     onClick={this.props.onWebClick}
                />
                }
                {this.props.data.preview_app &&
                <img alt="mobile"
                     className="device-icon"
                     src="/assets/images/theme/icon-mobile.svg"
                     onClick={this.props.onAppClick}
                />
                }
            </div>
        )
    }


    render(){
        const {children, data, componentIndex, indexGroup, ...other} = this.props
        return (
            <GSWidget className="collapsed-widget theme-component__common" {...other}>
                <GSWidgetHeader showCollapsedButton defaultOpen={this.state.isShowMore} onChangeCollapsedState={this.toggleShowMore}
                                className="wg-header"
                >
                    <div className="com-header">
                        <span className="com-name">
                            {this.state.title}
                        </span>
                        {this.renderSupportedDevices()}
                    </div>
                </GSWidgetHeader>
                <GSWidgetContent>
                    <div className="com-description">
                        {this.state.description}
                    </div>
                    <div className="com-content" hidden={!this.state.isShowMore}>

                        {/* GROUP OF TITLE */} 
                        {
                            this.state.isRequiredTitle &&
                            <div className="com-title">
                                <div className="com-title__tilte">
                                    <Label className="gs-frm-control__title">
                                        <Trans i18nKey="component.storefront.menu.item.title"/>
                                    </Label>
                                </div>
                                <div className="com-title__input">
                                    <TextItem
                                        key={"title_" + this.state.componentId + '_' + this.props.componentIndex}
                                        ref={(el) => this.titleRef = el}
                                        indexGroup={-1} // indexGroup for component = -1
                                        indexSchema={-1} // indexSchema for component = -1
                                        value={this.state.title} 
                                        callBackFunction={this.getComponentName}
                                        name={"title_" + this.state.componentId + '_' + this.props.componentIndex}
                                        validateRule={{isRequired: this.state.isRequiredTitle, isMaxLength: 100}}
                                        />                   
                                </div>
                            </div>
                        }
                            
                        
                        {/* GROUP OF IMAGE */}
                        {
                            this.state.isRequiredImage &&
                            <div className="com-image">
                                <div className="com-image__tilte">
                                    <Label className="gs-frm-control__title">
                                        <Trans i18nKey="page.shopee.product.tbheader.thumbnail"/>
                                    </Label>
                                </div>
                                <div className="com-image__upload">
                                    <ImageUploadItem 
                                        key={"image_" + this.state.componentId + '_' + this.props.componentIndex}
                                        ref={(el) => this.imageRef = el}
                                        indexGroup={-1} // indexGroup for component = -1
                                        indexSchema={-1} // indexSchema for component = -1
                                        url={this.state.image} 
                                        callBackFunction={this.getComponentImage}
                                        validateRule={{isRequired: this.state.isRequiredImage}}
                                        />                   
                                </div>
                            </div>
                        }

                        {/* GROUP OF SCHEMA */}
                        {
                            this.state.schemaGroup.map((group, indexGroup) => {
                                    return(
                                            <div className="schema-group">
                                                <div className="schema-group__head" onClick={(e) => this.toggleGroup(indexGroup)}>
                                                    <div className="grey-column">
                                                        <i 
                                                            className={this.state.lstCollapse[indexGroup] ? "icon-expand" : "icon-collapse"}
                                                        >
                                                        </i>
                                                    </div>
                                                    <div className="title">
                                                        <span className="text">{this.state.title}</span>
                                                        <span className="note">{this.props.data.note}</span>
                                                    </div>
                                                </div>
                                                <div className="schema-group__body" hidden={!this.state.lstCollapse[indexGroup]}>
                                                    <div className="grey-column"></div>
                                                    <div className="body">
                                                    {
                                                        group.map((schema, indexSchema) => {
                                                            return (
                                                                <div className="schema-line">
                                                                    <div className="schema-name">
                                                                        <Label className="gs-frm-control__title">
                                                                            {schema.data_type}
                                                                        </Label>
                                                                    </div>
                                                                    <div className="schema-content">
                                                                        {
                                                                            this.renderInputType(
                                                                                schema, 
                                                                                indexGroup, 
                                                                                indexSchema,
                                                                                indexGroup * group.length + indexSchema
                                                                            )
                                                                        }
                                                                    </div>
                                                                </div>
                                                            )
                                                        })
                                                    }
                                                    </div>
                                                </div>
                                            </div>
                                        
                                    );
                                    
                            })
                        }
                    </div>
                </GSWidgetContent>
            </GSWidget>
        );
    }

    renderInputType(schema, indexGroup, indexSchema, refIndex){
        let key = this.props.componentIndex + '_' + this.state.componentId + "_" + indexGroup + "_" + indexSchema
        let isRequired = schema.required ? true : false
        switch (schema.input_type){
            case this.ItemType.DROPDOWN_COLLECTION :
                return (
                    <>
                    <DropDownCollectionItem 
                        key={key}
                        ref={(el) => this.lstRef[refIndex] = el}
                        indexGroup={indexGroup} 
                        indexSchema={indexSchema}
                        collectionId={schema.value} 
                        callBackFunction={this.callBackOfText}
                        validateRule={{isRequired: isRequired}}
                        itemType={this.state.itemType}
                        />
                    <div className="schema-note">{schema.note}</div>
                    </>
                )
            case this.ItemType.DROPDOWN_MENU :
                return (
                    <>
                    <DropDownMenuItem 
                        key={key}
                        ref={(el) => this.lstRef[refIndex] = el}
                        indexGroup={indexGroup} 
                        indexSchema={indexSchema}
                        menuId={schema.value} 
                        callBackFunction={this.callBackOfText}
                        validateRule={{isRequired: isRequired}}
                        />
                    <div className="schema-note">{schema.note}</div>
                    </>
                )
            case this.ItemType.UPLOAD :
                return (
                    <>
                    <ImageUploadItem 
                        key={key}
                        ref={(el) => this.lstRef[refIndex] = el}
                        indexGroup={indexGroup} 
                        indexSchema={indexSchema}
                        url={schema.value} 
                        callBackFunction={this.callBackOfUpload}
                        validateRule={{isRequired: isRequired}}
                        />
                    <div className="schema-note">{schema.note}</div>
                    </>
                )
            case this.ItemType.HREF_MULTIPLE :
                return (
                    <>
                    <LinkToItem
                        key={key}
                        ref={(el) => this.lstRef[refIndex] = el}
                        indexGroup={indexGroup} 
                        indexSchema={indexSchema}
                        value={schema.value} 
                        callBackFunction={this.callBackOfText}
                        itemKey={key}
                        validateRule={{isRequired: isRequired}}
                        itemType={this.state.itemType}
                        />
                    <div className="schema-note">{schema.note}</div>
                    </>
                )
            case this.ItemType.TEXT :
                return (
                    <>
                    <TextItem
                        key={key}
                        ref={(el) => this.lstRef[refIndex] = el}
                        indexGroup={indexGroup} 
                        indexSchema={indexSchema}
                        value={schema.value} 
                        callBackFunction={this.callBackOfText}
                        name={key}
                        validateRule={{isRequired: isRequired, isMaxLength: 100}}
                        />
                    <div className="schema-note">{schema.note}</div>
                    </>
                )
            case this.ItemType.TEXTAREA :
                return (
                    <>
                    <TextAreaItem
                        key={key}
                        ref={(el) => this.lstRef[refIndex] = el}
                        indexGroup={indexGroup} 
                        indexSchema={indexSchema}
                        value={schema.value} 
                        callBackFunction={this.callBackOfText}
                        name={key}
                        validateRule={{isRequired: isRequired, isMaxLength: 500}}
                        />
                    <div className="schema-note">{schema.note}</div>
                    </>
                )
            case this.ItemType.HREF_DROPDOWN_COLLECTION :
                return (
                    <>
                    <DropDownCollectionItem 
                        key={key}
                        ref={(el) => this.lstRef[refIndex] = el}
                        indexGroup={indexGroup} 
                        indexSchema={indexSchema}
                        collectionId={schema.value} 
                        callBackFunction={this.callBackOfText}
                        validateRule={{isRequired: isRequired}}
                        itemType={this.state.itemType}
                        />
                    <div className="schema-note">{schema.note}</div>
                    </>
                )
        }
    }
}

ThemeComponent.propTypes = {
      componentIndex: PropTypes.any,
      data: PropTypes.shape({
          component_id: PropTypes.string,
          component_name: PropTypes.string,
          component_title: PropTypes.string,
          editable: PropTypes.bool,
          id: PropTypes.number,
          is_required_title: PropTypes.bool,
          order: PropTypes.number,
          platForm: PropTypes.oneOf(['WEB','WEB_APP','APP']),
          preview_web: PropTypes.string,
          preview_app: PropTypes.string,
      }),
      indexGroup: PropTypes.any,
    onWebClick: PropTypes.func,
    onAppClick: PropTypes.func,
}
