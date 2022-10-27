/*******************************************************************************
 * Copyright 2019 (C) Mediastep Software Inc.
 *
 * Created on : 26/08/2019
 * Author: Tien Dao <tien.dao@mediastep.com>
 *******************************************************************************/
import React from "react";
import './LinkToItem.sass'
import {Dropdown, DropdownItem, DropdownMenu, DropdownToggle} from 'reactstrap';
import i18next from "i18next";
import DropDownCollectionItem from "../DropDownCollectionItem/DropDownCollectionItem"
import DropDownPageItem from "../DropDownPageItem/DropDownPageItem"
import URLItem from "../URLItem/URLItem"
import ProductItem from "../ProductItem/ProductItem";
import ServiceItem from "../ServiceItem/ServiceItem";
import PropTypes from 'prop-types'

export const LINK_TO_ITEM_LINK_TYPE = {
    PAGE : "PAGE",
    COLLECTION: "COLLECTION",
    URL: "URL",
    PRODUCT: "PRODUCT",
    SERVICE: "SERVICE",
    NONE: 'NONE'
}


export default class LinkToItem extends React.Component {

    /*
    * PROPS
    *
    * 1. value : pageId, collectionId, prodcutId, url from props
    * 2. callBackFunction(
    *       indexGroup : group position from props,
    *       indexSchema : schema position from props,
    *       value : pageId, collectionId, prodcutId, url for parent component
    *    )
    * 3. validateRule: object to validation
    *     
    */


    state = {
        isOpen: false, // open toggle
        lstLinkType: this.props.lstLinkType,

        linkType: '',
        value: ''
    }

    constructor(props) {
        super(props)

        this.isValid = this.isValid.bind(this)
        this.selectItemType = this.selectItemType.bind(this)
        this.selectItemTypeToggle = this.selectItemTypeToggle.bind(this)
        this.receiveResultFromChild = this.receiveResultFromChild.bind(this)
    }

    componentDidMount() {
        if (this.props.lstLinkType.includes(LINK_TO_ITEM_LINK_TYPE.NONE) && !this.props.value) {
            // if select nothing
        } else {
            if(!this.props.value){
                this.setState({linkType: this.state.lstLinkType[0]})
                return;
            }

            // split value to know page or collection
            let value = this.props.value
            this.setState({
                linkType: value.split('|')[0],
                value: value.split('|')[1]
            })
        }
    }

    selectItemTypeToggle(){
        this.setState(prevState => ({
            isOpen: !prevState.isOpen
        }));  
    }

    selectItemType(data){

        if(data !== this.state.linkType){
            // reset value
            this.setState({value : ''})
        }

        this.setState({linkType : data})
    }

    receiveResultFromChild(indexGroup, indexSchema, value){
        this.setState({value: value})
        this.props.callBackFunction(indexGroup, indexSchema, value ? this.state.linkType + '|' +  value : "")
    }

    isValid(){
        if (this.itemRef) {
            let ref = this.itemRef.current ? this.itemRef.current : this.itemRef
            if(!this.state.value){
                this.props.callBackFunction(this.props.indexGroup, this.props.indexSchema, "")
                return ref.isValid()
            }else{
                this.props.callBackFunction(this.props.indexGroup, this.props.indexSchema, this.state.linkType + '|' +  this.state.value)
                return true
            }
        }
        return true
    }

    render() {
        return (
            <>
            <div className="link-to__item">

                {/* CHOOSE LINK TYPE */}
                <div className="choose-link__type">
                    <Dropdown 
                        isOpen={this.state.isOpen} 
                        toggle={this.selectItemTypeToggle}>

                        <DropdownToggle className="var-values__pool" caret>
                            <span>
                                {
                                    (this.state.linkType === LINK_TO_ITEM_LINK_TYPE.PRODUCT && (!this.props.itemType || this.props.itemType === 'BUSINESS_PRODUCT'))
                                    ? i18next.t('component.theme.item.linkto.product') 
                                    : (this.state.linkType === LINK_TO_ITEM_LINK_TYPE.SERVICE && (!this.props.itemType || this.props.itemType === 'SERVICE'))
                                    ? i18next.t('component.theme.item.linkto.service')
                                    : this.state.linkType === LINK_TO_ITEM_LINK_TYPE.PAGE 
                                    ? i18next.t('component.theme.item.linkto.page')
                                    : this.state.linkType === LINK_TO_ITEM_LINK_TYPE.COLLECTION 
                                    ? i18next.t('component.theme.item.linkto.collection')
                                    : this.state.linkType === LINK_TO_ITEM_LINK_TYPE.URL 
                                    ? i18next.t('component.theme.item.linkto.link')
                                    : i18next.t("page.buyLink.createdModal.selectNone")
                                }
                            </span>
                        </DropdownToggle>
                        <DropdownMenu className="multiple-select">
                            {
                                this.state.lstLinkType.map((data, index) =>{
                                    return (
                                        <DropdownItem 
                                            key={data + index} 
                                            onClick={() => this.selectItemType(data)} >

                                            <span>
                                                {
                                                    (data === LINK_TO_ITEM_LINK_TYPE.PRODUCT && (!this.props.itemType || this.props.itemType === 'BUSINESS_PRODUCT'))
                                                    ? i18next.t('component.theme.item.linkto.product')
                                                    : (data === LINK_TO_ITEM_LINK_TYPE.SERVICE && (!this.props.itemType || this.props.itemType === 'SERVICE'))
                                                    ? i18next.t('component.theme.item.linkto.service')
                                                    : data === LINK_TO_ITEM_LINK_TYPE.PAGE 
                                                    ? i18next.t('component.theme.item.linkto.page')
                                                    : data === LINK_TO_ITEM_LINK_TYPE.COLLECTION 
                                                    ? i18next.t('component.theme.item.linkto.collection')
                                                    : data === LINK_TO_ITEM_LINK_TYPE.URL 
                                                    ? i18next.t('component.theme.item.linkto.link')
                                                    : data === LINK_TO_ITEM_LINK_TYPE.NONE
                                                    ? i18next.t("page.buyLink.createdModal.selectNone")
                                                                        : ''

                                                }
                                            </span>    

                                        </DropdownItem>
                                    )
                                })
                            } 
                        </DropdownMenu>
                    </Dropdown>
                </div>
                

                {/* CHOOSE PAGE OR COLLECTION */}
                <div className="choose-link__value">
                    {
                        this.state.linkType === LINK_TO_ITEM_LINK_TYPE.PAGE
                        ? <DropDownPageItem 
                            ref={(el) => this.itemRef = el}
                            key={this.props.itemKey} 
                            indexGroup={this.props.indexGroup}
                            indexSchema={this.props.indexSchema}
                            pageId={this.state.value} 
                            callBackFunction={this.receiveResultFromChild}
                            validateRule={this.props.validateRule}
                        />
                        : this.state.linkType === LINK_TO_ITEM_LINK_TYPE.COLLECTION
                        ? <DropDownCollectionItem 
                            ref={(el) => this.itemRef = el}
                            key={this.props.itemKey}  
                            indexGroup={this.props.indexGroup}
                            indexSchema={this.props.indexSchema}
                            collectionId={this.state.value} 
                            callBackFunction={this.receiveResultFromChild}
                            validateRule={this.props.validateRule}
                            itemType={this.props.itemType}
                        />
                        : this.state.linkType === LINK_TO_ITEM_LINK_TYPE.URL 
                        ? <URLItem
                            ref={(el) => this.itemRef = el}
                            key={this.props.itemKey}
                            indexGroup={this.props.indexGroup} 
                            indexSchema={this.props.indexSchema}
                            value={this.state.value} 
                            callBackFunction={this.receiveResultFromChild}
                            name={this.props.itemKey}
                            validateRule={{...this.props.validateRule, isMaxLength: 500}}
                        />
                        : (this.state.linkType === LINK_TO_ITEM_LINK_TYPE.PRODUCT && (!this.props.itemType || this.props.itemType === 'BUSINESS_PRODUCT'))
                        ? <ProductItem
                            ref={(el) => this.itemRef = el}
                            key={this.props.itemKey}
                            indexGroup={this.props.indexGroup} 
                            indexSchema={this.props.indexSchema}
                            productId={this.state.value} 
                            callBackFunction={this.receiveResultFromChild}
                            validateRule={this.props.validateRule}
                        />
                        : (this.state.linkType === LINK_TO_ITEM_LINK_TYPE.SERVICE && (!this.props.itemType || this.props.itemType === 'SERVICE'))
                        ? <ServiceItem
                            ref={(el) => this.itemRef = el}
                            key={this.props.itemKey}
                            indexGroup={this.props.indexGroup} 
                            indexSchema={this.props.indexSchema}
                            productId={this.state.value} 
                            callBackFunction={this.receiveResultFromChild}
                            validateRule={this.props.validateRule}
                        />
                        : <></>

                    }
                </div>
                
            </div>
             </>
        )
    }

}

LinkToItem.defaultProps = {
    lstLinkType: [
        LINK_TO_ITEM_LINK_TYPE.URL,
        LINK_TO_ITEM_LINK_TYPE.PAGE,
        LINK_TO_ITEM_LINK_TYPE.COLLECTION,
        LINK_TO_ITEM_LINK_TYPE.PRODUCT,
        LINK_TO_ITEM_LINK_TYPE.SERVICE
    ],
}

LinkToItem.propTypes = {
  callBackFunction: PropTypes.any,
  indexGroup: PropTypes.any,
  indexSchema: PropTypes.any,
  itemKey: PropTypes.any,
  validateRule: PropTypes.any,
  value: PropTypes.any,
    lstLinkType: PropTypes.array,
    itemType: PropTypes.oneOf(['BUSINESS_PRODUCT', 'SERVICE']),
    enabledNoneSelect: PropTypes.bool,
}
