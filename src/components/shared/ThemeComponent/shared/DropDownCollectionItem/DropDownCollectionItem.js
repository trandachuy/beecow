/*******************************************************************************
 * Copyright 2019 (C) Mediastep Software Inc.
 *
 * Created on : 26/08/2019
 * Author: Tien Dao <tien.dao@mediastep.com>
 *******************************************************************************/
import React from "react";
import './DropDownCollectionItem.sass'
import {Dropdown, DropdownItem, DropdownMenu, DropdownToggle} from 'reactstrap';
import {CollectionService} from "../../../../../services/CollectionService";
import LoadingScreen from "../../../LoadingScreen/LoadingScreen";
import {LoadingStyle} from "../../../Loading/Loading";
import AlertInline, {AlertInlineType} from "../../../AlertInline/AlertInline";
import {CredentialUtils} from "../../../../../utils/credential";
import {ThemeValidationUtils} from "../../../../../utils/theme-validation";


export default class DropDownCollectionItem extends React.Component {

    /*
    * PROPS
    *
    * 1. collectionId : id of collection item from props
    * 2. callBackFunction(
    *       indexGroup : group position from props,
    *       indexSchema : schema position from props,
    *       collectionId : output collectionId for parent component
    *    )
    * 3. validateRule: object to validation
    *     
    */

    SIZE_PER_PAGE = 10

    state = {
        isProcessing: false,
        isOpen: false, // open toggle
        error: null,
        
        collectionName: '',
        data: [],
        collectionId: ''
    }

    constructor(props) {
        super(props)

        this.isBottom = this.isBottom.bind(this);
        this.onScroll = this.onScroll.bind(this);
        this.getCollectionsByBcStoreId = this.getCollectionsByBcStoreId.bind(this)
        this.selectCollection = this.selectCollection.bind(this)
        this.collectionToggle = this.collectionToggle.bind(this);
        this.isValid = this.isValid.bind(this)

        this.currentPage = 0
        this.totalPage = 0
    }

    componentDidMount() {

        if(!this.props.collectionId){
            return;
        }
        
        this.setState({
            isProcessing: true
        })

        this.setState({
            collectionId : this.props.collectionId
        }, () => {

            // get current collection
            CollectionService.getCollectionDetailWithHandleError(this.state.collectionId).then(res =>{
                if(res){
                    this.setState({
                        collectionName: res.collectionName,
                    })
                }else{
                    // in case collection deteled
                    this.setState({
                        collectionId : '',
                        collectionName: ''
                    })
                    this.props.callBackFunction(this.props.indexGroup, this.props.indexSchema, '')
                }

                this.setState({isProcessing: false})
                
            }).catch(e =>{
                this.props.callBackFunction(this.props.indexGroup, this.props.indexSchema, '')
                this.setState({isProcessing: false})
            })
        })
        
    }

    getCollectionsByBcStoreId(storeId, page, size) {
        CollectionService.getCollectionsByBcStoreId({sellerId: storeId, page: page, size: size, itemType: this.props.itemType}).then(res => {
            clearTimeout(this.timeOut);
            
            let data = this.state.data.slice();
            
            if(page === 0){
                data = [];
            }
            
            data = [...data, ...res.content];
            
            this.setState({ 
                data: data, 
                isProcessing: false
            })

            this.setState({ 
                data: data, 
                isProcessing: false
            })

            this.totalPage = res.totalPages;
            this.currentPage++;

        }).catch(e =>{

        })
    }

    collectionToggle() {

        // reset current page
        this.currentPage = 0

        this.setState(prevState => ({
            isOpen: !prevState.isOpen
        }), () => {
            if(this.state.isOpen){
                this.getCollectionsByBcStoreId(CredentialUtils.getStoreId(), 0, this.SIZE_PER_PAGE);
            }else{
                let error = ThemeValidationUtils.themeValidationId(this.props.validateRule, this.state.collectionId)
                this.setState({error: error})
            }
        });    
    }

    isBottom(el) {
        let afterCal = Math.floor(el.scrollHeight - el.scrollTop);
        return afterCal <= el.clientHeight;
    }

    onScroll(event){
        event.preventDefault();
        event.stopPropagation();
        
        if(!this.scrolled){
            this.scrolled = true;
            
            if(this.isBottom(event.currentTarget) && this.currentPage <= this.totalPage){
                
                event.currentTarget.classList.add('scroll-y-invisible');
                
                this.setState({
                    isProcessing: true
                })

                this.timeOut = setTimeout( () => {
                    this.getCollectionsByBcStoreId(CredentialUtils.getStoreId(), this.currentPage, this.SIZE_PER_PAGE);
                }, 1500)   
            }
            this.scrolled = false;
        }
    }

    selectCollection(data){
        this.setState({
            collectionName: data.collectionName,
            collectionId: data.id,
            error: {isError: false, message: ''}
        })
        this.props.callBackFunction(this.props.indexGroup, this.props.indexSchema, data.id)
    }

    isValid(){
        let error = ThemeValidationUtils.themeValidationId(this.props.validateRule, this.state.collectionId)
        this.setState({error: error})

        if(!error){
            this.props.callBackFunction(this.props.indexGroup, this.props.indexSchema, this.state.collectionId)
        }

        return !error
    }

    render() {
        return (
            <>

            {
                this.state.isProcessing && 
                <LoadingScreen loadingStyle={LoadingStyle.DUAL_RING_WHITE}/>
            }

            <Dropdown 
                className="dropdown-collection_item"
                isOpen={this.state.isOpen} 
                toggle={this.collectionToggle}>

                <DropdownToggle className="var-values__pool">
                    <span>{this.state.collectionName}</span>
                </DropdownToggle>

                <DropdownMenu 
                    className="multiple-select" 
                    onScroll={this.onScroll}>
                    {
                        this.state.data.length > 0 && 
                        
                        this.state.data.map((data, index) =>{
                            return (
                                <DropdownItem 
                                    key={data.id + ' collection  ' + index} 
                                    onClick={ () => this.selectCollection(data)}>

                                    <span>{data.collectionName}</span>    

                                </DropdownItem>
                            )
                        })
                    } 
                </DropdownMenu>
             </Dropdown>
             {
                (this.state.error && this.state.error.isError) &&
                <AlertInline 
                    className="dropdown-collection_item-error"
                    type={AlertInlineType.ERROR}
                    nonIcon
                    text={this.state.error.message}/>
             }
             
             </>
        )
    }

}



