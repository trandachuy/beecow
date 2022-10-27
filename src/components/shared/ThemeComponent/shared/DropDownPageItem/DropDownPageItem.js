/*******************************************************************************
 * Copyright 2019 (C) Mediastep Software Inc.
 *
 * Created on : 26/08/2019
 * Author: Tien Dao <tien.dao@mediastep.com>
 *******************************************************************************/
import React from "react";
import './DropDownPageItem.sass'
import {Dropdown, DropdownItem, DropdownMenu, DropdownToggle} from 'reactstrap';
import PageService from "../../../../../services/PageService";
import LoadingScreen from "../../../LoadingScreen/LoadingScreen";
import {LoadingStyle} from "../../../Loading/Loading";
import AlertInline, {AlertInlineType} from "../../../AlertInline/AlertInline";
import {ThemeValidationUtils} from "../../../../../utils/theme-validation";
import storageService from "../../../../../services/storage";
import Constants from "../../../../../config/Constant";
import customPageService from "../../../../../services/CustomPageService";
import {CredentialUtils} from "../../../../../utils/credential";


export default class DropDownPageItem extends React.Component {

    /*
    * PROPS
    *
    * 1. pageId : id of page item from props
    * 2. callBackFunction(
    *       indexGroup : group position from props,
    *       indexSchema : schema position from props,
    *       pageId : output pageId for parent component
    *    )
    * 3. validateRule: object to validation
    *     
    */

    SIZE_PER_PAGE = 10

    state = {
        isProcessing: false,
        isOpen: false, // open toggle
        error: null,
        
        pageName: '',
        data: [],
        pageId: ''
    }

    constructor(props) {
        super(props)

        

        this.isBottom = this.isBottom.bind(this);
        this.onScroll = this.onScroll.bind(this);
        this.getPagesByBcStoreId = this.getPagesByBcStoreId.bind(this)
        this.selectPage = this.selectPage.bind(this)
        this.pageToggle = this.pageToggle.bind(this);
        this.isValid = this.isValid.bind(this)

        this.currentPage = 0
        this.totalPage = 0
    }

    componentDidMount() {

        if(!this.props.pageId){
            return;
        }
        
        this.setState({
            isProcessing: true
        })

        this.setState({
            pageId : this.props.pageId
        }, () => {

            // get current page
            customPageService.getCustomPageById(this.state.pageId).then(res =>{
                
                this.setState({
                    pageName: res.data.title,
                    isProcessing: false
                })

            }).catch(e =>{
                this.props.callBackFunction(this.props.indexGroup, this.props.indexSchema, '')
                this.setState({pageId: '', pageName: '', isProcessing: false})
            })
        })
        
    }

    getPagesByBcStoreId(page, size) {
        const useNewThemeEngine = CredentialUtils.getThemeEngine();
        if(useNewThemeEngine) {
            customPageService.getCustomPagesForMenu({page: page, size: size}).then(res => {
                clearTimeout(this.timeOut);
                
                let data = this.state.data.slice();
                
                if(page === 0){
                    data = [];
                }
                
                data = [...data, ...res.data];

                this.setState({ 
                    data: data, 
                    isProcessing: false
                })

                this.totalPage = Math.ceil(parseInt(res.headers['x-total-count']) / this.SIZE_PER_PAGE),
                this.currentPage++;
            })
        } else {
            PageService.getPagesByBcStoreId({page: page, size: size}).then(res => {
                clearTimeout(this.timeOut);
                
                let data = this.state.data.slice();
                
                if(page === 0){
                    data = [];
                }
                
                data = [...data, ...res.data];

                this.setState({ 
                    data: data, 
                    isProcessing: false
                })

                this.totalPage = Math.ceil(parseInt(res.headers['x-total-count']) / this.SIZE_PER_PAGE),
                this.currentPage++;

            }).catch(e =>{

            })
        }
    }

    pageToggle() {

        // reset current page
        this.currentPage = 0

        this.setState(prevState => ({
            isOpen: !prevState.isOpen
        }), () => {
            if(this.state.isOpen){
                this.getPagesByBcStoreId(0, this.SIZE_PER_PAGE);
            }else{
                let error = ThemeValidationUtils.themeValidationId(this.props.validateRule, this.state.pageId)
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
                    this.getPagesByBcStoreId(this.currentPage, this.SIZE_PER_PAGE);
                }, 1500)   
            }
            this.scrolled = false;
        }
    }

    selectPage(data){
        this.setState({
            pageName: data.name,
            pageId: data.id,
            error: {isError: false, message: ''}
        })

        this.props.callBackFunction(this.props.indexGroup, this.props.indexSchema, data.id)
    }

    isValid(){
        let error = ThemeValidationUtils.themeValidationId(this.props.validateRule, this.state.pageId)
        this.setState({error: error})

        if(!error){
            this.props.callBackFunction(this.props.indexGroup, this.props.indexSchema, this.state.pageId)
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
                className="dropdown-page_item"
                isOpen={this.state.isOpen} 
                toggle={this.pageToggle}>

                

                <DropdownToggle className="var-values__pool">
                    <span>{this.state.pageName}</span>
                </DropdownToggle>

                <DropdownMenu 
                    className="multiple-select" 
                    onScroll={this.onScroll}>
                    {
                        this.state.data.length > 0 && 
                        
                        this.state.data.map((data, index) =>{
                            return (
                                <DropdownItem 
                                    key={data.id + ' page  ' + index} 
                                    onClick={ () => this.selectPage(data)}>

                                    <span>{data.name}</span>    

                                </DropdownItem>
                            )
                        })
                    } 
                </DropdownMenu>
             </Dropdown>
             {
                (this.state.error && this.state.error.isError) &&
                <AlertInline 
                    className="dropdown-page_item-error"
                    type={AlertInlineType.ERROR}
                    nonIcon
                    text={this.state.error.message}/>
             }
             
             </>
        )
    }

}
