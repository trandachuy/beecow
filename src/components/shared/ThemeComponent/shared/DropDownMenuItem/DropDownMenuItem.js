/*******************************************************************************
 * Copyright 2019 (C) Mediastep Software Inc.
 *
 * Created on : 26/08/2019
 * Author: Tien Dao <tien.dao@mediastep.com>
 *******************************************************************************/
import React from "react";
import './DropDownMenuItem.sass'
import {Dropdown, DropdownItem, DropdownMenu, DropdownToggle} from 'reactstrap';
import menuService from "../../../../../services/MenuService";
import LoadingScreen from "../../../LoadingScreen/LoadingScreen";
import {LoadingStyle} from "../../../Loading/Loading";
import AlertInline, {AlertInlineType} from "../../../AlertInline/AlertInline";
import {CredentialUtils} from "../../../../../utils/credential";
import {ThemeValidationUtils} from "../../../../../utils/theme-validation";


export default class DropDownMenuItem extends React.Component {

    /*
    * PROPS
    *
    * 1. menuId : id of menu item from props
    * 2. callBackFunction(
    *       indexGroup : group position from props,
    *       indexSchema : schema position from props,
    *       menuId : output menuId for parent component
    *    )
    *     
    */

    SIZE_PER_PAGE = 10

    state = {
        isProcessing: false,
        isOpen: false, // open toggle
        error: null,
        
        menuName: '',
        data: [],
        menuId: ''
    }

    constructor(props) {
        super(props)

        this.isBottom = this.isBottom.bind(this);
        this.onScroll = this.onScroll.bind(this);
        this.getMenusByBcStoreId = this.getMenusByBcStoreId.bind(this)
        this.selectMenu = this.selectMenu.bind(this)
        this.menuToggle = this.menuToggle.bind(this);
        this.isValid = this.isValid.bind(this)

        this.currentPage = 0
        this.totalPage = 0
    }

    componentDidMount() {

        if(!this.props.menuId){
            return;
        }
        
        this.setState({
            isProcessing: true
        })

        this.setState({
            menuId : this.props.menuId
        }, () => {

            // get current menu
            menuService.getMenuById(this.state.menuId).then(res =>{
                
                this.setState({
                    menuName: res.name,
                    isProcessing: false
                })

            }).catch(e =>{
                this.props.callBackFunction(this.props.indexGroup, this.props.indexSchema, '')
                this.setState({menuId: '', menuName: '', isProcessing: false})
            })
        })
        
    }

    getMenusByBcStoreId(storeId, page, size) {
        menuService.getMenuByBcStoreIdByPage({sellerId: storeId, page: page, size: size}).then(res => {
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

    menuToggle() {

        // reset current page
        this.currentPage = 0

        this.setState(prevState => ({
            isOpen: !prevState.isOpen
        }), () => {
            if(this.state.isOpen){
                this.getMenusByBcStoreId(CredentialUtils.getStoreId(), 0, this.SIZE_PER_PAGE);
            }else{
                let error = ThemeValidationUtils.themeValidationId(this.props.validateRule, this.state.menuId)
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
                    this.getMenusByBcStoreId(CredentialUtils.getStoreId(), this.currentPage, this.SIZE_PER_PAGE);
                }, 1500)   
            }
            this.scrolled = false;
        }
    }

    selectMenu(data){
        this.setState({
            menuName: data.name,
            menuId: data.id,
            error: {isError: false, message: ''}
        })

        this.props.callBackFunction(this.props.indexGroup, this.props.indexSchema, data.id)
    }

    isValid(){
        let error = ThemeValidationUtils.themeValidationId(this.props.validateRule, this.state.menuId)
        this.setState({error: error})

        if(!error){
            this.props.callBackFunction(this.props.indexGroup, this.props.indexSchema, this.state.menuId)
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
                className="dropdown-menu_item"
                isOpen={this.state.isOpen} 
                toggle={this.menuToggle}>

                <DropdownToggle className="var-values__pool">
                    <span>{this.state.menuName}</span>
                </DropdownToggle>

                <DropdownMenu 
                    className="multiple-select" 
                    onScroll={this.onScroll}>
                    {
                        this.state.data.length > 0 && 
                        
                        this.state.data.map((data, index) =>{
                            return (
                                <DropdownItem 
                                    key={data.id + ' menu  ' + index} 
                                    onClick={ () => this.selectMenu(data)}>

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
                    className="dropdown-menu_item-error"
                    type={AlertInlineType.ERROR}
                    nonIcon
                    text={this.state.error.message}/>
             }
             
             </>
        )
    }

}



