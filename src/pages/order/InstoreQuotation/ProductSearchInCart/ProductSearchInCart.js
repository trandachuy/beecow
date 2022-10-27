/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 17/12/2020
 * Author: Dinh Vo <dinh.vo@mediastep.com>
 *******************************************************************************/
import React, {useContext, useEffect, useRef, useState} from 'react';
import './ProductSearchInCart.sass';
import {UikInput, UikSelect} from '../../../../@uik';
import {ContextQuotation} from '../context/ContextQuotation'
import {ContextQuotationService} from '../context/ContextQuotationService'
import {CurrencyUtils} from "../../../../utils/number-format";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {GSToast} from "../../../../utils/gs-toast";
import {ItemService} from "../../../../services/ItemService";
import Loading, {LoadingStyle} from "../../../../components/shared/Loading/Loading";
import _ from 'lodash';
import Constants from "../../../../config/Constant";
import storeService from '../../../../services/StoreService';
import ConfirmModal from '../../../../components/shared/ConfirmModal/ConfirmModal';
import i18n from '../../../../config/i18n';
import {SEARCH_BY_ENUM} from '../../../products/ProductList/BarcodePrinter/ProductListBarcodePrinter';
import {CredentialUtils} from "../../../../utils/credential";
import i18next from "i18next";
const SIZE_PER_PAGE = 10
const ProductSearchInCart = props => {
    const {state, dispatch} = useContext(ContextQuotation.context);
    const refTimeout = useRef(null);
    let refConfirmSwitchBranch = useRef(null);
    const onSearch = useRef(false);
    const [isSearching, setIsSearching] = useState(''); 
    const [lstProduct, setLstProduct] = useState([]); 
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPage: 0,
        itemCount: 0
    });  
    const [showSearch, setshowSearch] = useState(false);
    const [stSearchBy, setStSearchBy] = useState({
        value: SEARCH_BY_ENUM.PRODUCT
    });
    const [stFilterBranchBy, setStFilterBranchBy] = useState();
    const [stBranches, setStBranches] = useState([]);
    // if has no default branch -> set Is show = true
    const [stIsShowBranchSelector, setStIsShowBranchSelector] = useState(!CredentialUtils.getDontShowDefaultBranch());

    useEffect(() => {
        fetchBranch();
    },[])

    useEffect( () => {
        if(!state.searchProductText){
            setPagination(pagination => ({
                ...pagination,
                totalPage: 0,
                itemCount: 0,
                currentPage: 1
            }))
            setLstProduct([])
            return;
        }
        clearTimeout(refTimeout.current)
        refTimeout.current = setTimeout(searchProduct(), 300);
    }, [state.searchProductText, stSearchBy.value])

    // for scroll
    useEffect( () => {
        if(pagination.currentPage <= 1){
            return;
        }

        scrollFindProduct();
    }, [pagination.currentPage])
    const searchProduct = () => {

        const params = {
            keyword: state.searchProductText,
            locationCode: 'VN',
            sort: 'PRICE_ASC',
            branchId: stFilterBranchBy.value
        }
        // getRemainingAProduct()
        ItemService.getProductSuggestionByName(
            pagination.currentPage - 1, //page 
            SIZE_PER_PAGE, // size
            stSearchBy.value,
            params.keyword,
            true,
            '',
            {
                branchIds:stBranches, //select all branchs
                includeConversion:true
            }
        ).then(result => {
            setLstProduct(separateModel(result.data))
            setPagination(stPagination => ({
                ...stPagination,
                totalPage: Math.ceil(parseInt(result.headers['x-total-count']) / SIZE_PER_PAGE),
                itemCount: parseInt(result.headers['x-total-count']),
                currentPage: 1
            }))
        }).catch(e => {
            GSToast.commonError()
        }).finally(() => {
            setIsSearching(false)
        })
    }

    const scrollFindProduct = () => {
        setIsSearching(true)

        const params = {
            keyword: state.searchProductText,
            locationCode: 'VN',
            sort: 'PRICE_ASC',
            branchId: stFilterBranchBy.value
        }

        ItemService.getProductSuggestionByName(
            pagination.currentPage - 1, //page 
            SIZE_PER_PAGE, // size
            stSearchBy.value,
            params.keyword,
            true,
            params.branchId,
            {includeConversion:true}
        ).then(result => {
            // separate model to new row before add to list
            let resultList = separateModel(result.data)
            if (pagination.currentPage === 1) { // => if this is first page -> clear all previous list
                setLstProduct(resultList)
             } else { // => if this is not first page -> append to previous list
                setLstProduct(lstProduct => [...lstProduct, ...resultList])
            }
     
            setPagination({
                ...pagination,
                totalPage: Math.ceil(parseInt(result.headers['x-total-count']) / SIZE_PER_PAGE),
                itemCount: parseInt(result.headers['x-total-count'])
            })
        }).catch(e => {
            GSToast.commonError()
        }).finally(() => {
            setIsSearching(false)
        })
    }

    const separateModel = (productList) => {
        let resultList = _.cloneDeep(productList).map(p => ({
            ...p,
            name: p.itemName,
            image: p.itemImage
        }))
        return resultList
    }

    const fetchBranch = async (page, size) => {
        try {
            const result = await storeService.getActiveStoreBranches();
            if(result) {
                const branchIDs=[];
                const branches = result.map((branch) => {
                    // get default working branch from local first -> unless get default branch from server
                    const localDefaultBranch = CredentialUtils.getStoreDefaultBranch()
                    if (localDefaultBranch) {
                        setStFilterBranchBy({value: parseInt(localDefaultBranch)});
                        dispatch(ContextQuotation.actions.setStoreBranch({value: parseInt(localDefaultBranch)}));
                    } else {
                        if(branch.isDefault === true) {
                            setStFilterBranchBy({value: branch.id});
                            dispatch(ContextQuotation.actions.setStoreBranch({value: branch.id}));
                        }
                    }
                    branchIDs.push(branch.id)
                    return {value: branch.id, label: branch.name};
                })

                //in case staff login without default branch in there
                if(!stFilterBranchBy) {
                    setStFilterBranchBy({value: branches[0].value});
                    dispatch(ContextQuotation.actions.setStoreBranch({value: branches[0].value}));
                }
                setStBranches(branchIDs);
            }
        } catch(e) {
            GSToast.commonCreate();
        }
    }

    const onInputSearch = (event) => {
        const keyword = event.target.value
        if (this.stoSearch) clearTimeout(this.stoSearch)

        this.stoSearch = setTimeout( () => {
            dispatch(ContextQuotation.actions.setSearchProductText(keyword))
            event.preventDefault()
        }, 1000)
    }

    const scrollProductList = (e) => {
        const bottom = isBottom(e.currentTarget)
        if (bottom && pagination.currentPage < pagination.totalPage) {
            setPagination({
                ...pagination,
                currentPage: pagination.currentPage + 1
            })
            setIsSearching(true)
        }
    }

    const isBottom = (el) => {
        let afterCal = Math.floor(el.scrollHeight - el.scrollTop);
        return afterCal <= el.clientHeight;
    }

    const selectProduct = (product) => {
        if(product.parentId){
            GSToast.error(i18next.t("message.not.allow.to.create.quotation.for.conversion.unit.at.this.time"))
            return
        }
        product.checked = true
        product.quantity = 1
        product.id = product.id? product.id:product.itemId
        product.branchId = stFilterBranchBy.value;
        dispatch(ContextQuotation.actions.addNewProduct(product))
        // temp product list
        const productList = _.cloneDeep(state.productList)
        const existedProduct = productList.find(p => p.id === product.id)
        if (existedProduct) {
            existedProduct.quantity = parseInt(existedProduct.quantity) + 1
        } else {
            productList.unshift(product)
        }

        ContextQuotationService.dispatchUpdateProductList(state, dispatch, productList)
        setshowSearch(false)
    }

    const openProductList = () => {
        setshowSearch(true)
    }

    const closeProductList = (e) => {
        if(e.relatedTarget && e.relatedTarget.classList && e.relatedTarget.classList.contains('product-item-row')){
            setshowSearch(true)
        }else{
            setshowSearch(false)
        }
    }

    const onChangeSearchBy = (e) => {
        setStSearchBy(e);
    }

    const onSwitchBranch = (e) => {
        const isShow = localStorage.getItem(Constants.UTILITY.ORDER_CONFIRM_MODAL_SWITCH_BRANCH_NOT_SHOW);
        if(refConfirmSwitchBranch && Boolean(isShow) === false) {
            refConfirmSwitchBranch.openModal({
                messageHtml: true,
                messages: <ConfirmModalContent name={e.label} handleClick={onClickDontShowItAgain} />,
                okCallback: () => {
                    dispatch(ContextQuotation.actions.reset());
                    setStFilterBranchBy(e);
                    dispatch(ContextQuotation.actions.setStoreBranch(e));
                }
            });
        } else {
            setStFilterBranchBy(e);
            dispatch(ContextQuotation.actions.setStoreBranch(e))
        }
    }

    const onClickDontShowItAgain = (isChecked) => {
        if(isChecked) {
            return localStorage.setItem(Constants.UTILITY.ORDER_CONFIRM_MODAL_SWITCH_BRANCH_NOT_SHOW, true);
        }
        return localStorage.removeItem(Constants.UTILITY.ORDER_CONFIRM_MODAL_SWITCH_BRANCH_NOT_SHOW, false);
    }

    const isShowBranchSelector = () => {
        return stBranches.length > 1 && stIsShowBranchSelector
    }

    const onOkBranchSelector = ({selected, checkedDontShowAgain}) => {
        CredentialUtils.setDontShowDefaultBranch(checkedDontShowAgain)
        CredentialUtils.setStoreDefaultBranch(selected)
        setStIsShowBranchSelector(false)
        setStFilterBranchBy({value: selected});
        dispatch(ContextQuotation.actions.setStoreBranch({value: selected}));
    }
    return (
        <>
            <div className="uik-widget-title__wrapper gs-widget__header bg-gray" style={{border:'none'}}>
                <h3>
                      <div className="quotation-instore-purchase">
                          <div className="d-flex align-items-center" >
                          <UikSelect
                            onChange={onChangeSearchBy}
                            position={'bottomRight'}
                            value={[stSearchBy]}
                            style={{
                                width: '100px'
                            }}
                            options={ [
                                {
                                    value: SEARCH_BY_ENUM.PRODUCT,
                                    label: i18next.t('page.product.list.printBarCode.product'),
                                },
                                {
                                    value: SEARCH_BY_ENUM.BARCODE,
                                    label: i18next.t('page.product.list.printBarCode.barcode'),
                                }
                            ] }
                        />
                              <div className="search-box__wrapper" onClick={openProductList} onBlur={closeProductList} id="dropdownSuggestionProduct" style={{marginRight: 'auto'}}>
                              <UikInput
                                    key={state.searchProductText}
                                    onChange={onInputSearch}
                                    icon={(
                                        <FontAwesomeIcon icon="search"/>
                                    )}
                                    placeholder={i18next.t(stSearchBy.value === SEARCH_BY_ENUM.PRODUCT? "page.product.list.printBarCode.searchByProduct":"page.product.list.printBarCode.searchByBarcode")}
                                    defaultValue={state.searchProductText}
                        />
                                                  </div>
                                                 
                                                                      <div style={{marginLeft: '10px'}}>
                                                                          <div className="uik-select__wrapper">
                                                                              {/* <button className="uik-btn__base uik-select__valueRendered" type="button">
                                                                                  <span className="uik-btn__content">
                                                                                      <div className="uik-select__valueRenderedWrapper">
                                                                                          <div className="uik-select__valueWrapper">Head Office 130 trường sơn tân bình</div>
                                                                                          <div className="uik-select__arrowWrapper" />
                                                                                          </div>
                                                                                          </span>
                                                                                          </button> */}
                                                                                          </div>
                                                                                          </div>
                                                                                          </div>
                                                                                          {   
                    <div 
                        hidden={!showSearch}
                        style={{display: 'block', top: '0px'}}
                        className="dropdown-menu dropdown-menu-right search-list__result font-weight-normal"
                        onScroll={scrollProductList} 
                        onBlur={closeProductList}>
                            
                            {lstProduct.map((product, index) => {
                                return (
                                   <div key={product.id} className={product.parentId ? "product-item unit" : "product-item"}>
                                       <div
                                           key={product.barcode}
                                           className={product.parentId ? "product-item-row gsa-hover--gray gs-atm__scrollbar-1 unit"
                                               : "product-item-row gsa-hover--gray gs-atm__scrollbar-1"}
                                           onClick={() => selectProduct(product)}
                                           tabIndex={0}
                                       >
                                           <img src={product.image}
                                                alt="product-thumbnail"
                                                className="product-item-row__thumbnail"
                                           />
                                           <div className="product-item-row__product-summary">
                                               <h6 className="product-item-row__product-name mb-0">
                                                   {product.name}
                                               </h6>
                                               {product.modelName &&
                                               <span className="product-item-row__variation-name">
                                                    {product.modelName.replace('|' + Constants.DEPOSIT_CODE.FULL, '')}
                                            </span>
                                               }
                                               <div>
                                                   <code className="font-size-14px color-gray">{product.barcode}</code>
                                               </div>
                                           </div>

                                           <div>
                                               <span className="product-item-row__price">{CurrencyUtils.formatMoneyByCurrency(product.price, product.currency)}</span>
                                               {product.conversionUnitName &&
                                               <p style={{color:"#556CE7"}}>
                                                   <span>{i18next.t('page.transfer.stock.table.column.unit')}: </span> {product.conversionUnitName}
                                               </p>
                                               }
                                           </div>
                                       </div>
                                       <div className="product-item-row-border"></div>
                                   </div>
                                )
                            })}
                  

                            <div
                                style={{
                                    height: '50px',
                                    display: lstProduct.length === 0? 'flex':'none',
                                    justifyContent: 'center',
                                    borderBottom: 'unset',
                                    boxShadow: 'unset',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    cursor: 'pointer',
                                    fontSize:'14px',
                                    alignItems: 'center',
                                    padding: '.2rem 1rem'
                                }}
                            >

                                {isSearching && <Loading style={LoadingStyle.ELLIPSIS_GREY}/>}
                                {
                                    (!isSearching && (!lstProduct || lstProduct.length === 0 ) && state.searchProductText) &&
                                    i18next.t('page.order.create.product.search.not_found')
                                }
                                {
                                    (!isSearching && (!lstProduct || lstProduct.length === 0 ) && !state.searchProductText) &&
                                    i18next.t('page.order.create.product.search.not_input')
                                }
                        </div>
                    </div>
                    }
                </div>
            </h3>
        </div>
        <ConfirmModal 
            ref={(el) => {
                refConfirmSwitchBranch = el;
        }}/>
    </>
    );
    
};
const ConfirmModalContent = props => {

    const clickOnCheckbox = (e) => {
        if(props.handleClick) {
            props.handleClick(e.target.checked);
        }
    }

    return (<>
        <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start"
            }}>
            <p>{i18n.t("page.product.modal.branch.confirm.body", {name: props.name})}</p>
            <div style={{display: "inline-table"}}>
                <input 
                    type="checkbox" 
                    name="dontshowitagain"
                    id="dontshowitagain"
                    style={{
                        marginRight: "10px",
                        height: "20px",
                        width: "20px",
                        verticalAlign: "sub",
                        color: "var(--primary)"
                    }} 
                    onClick={clickOnCheckbox}/>
                <label for="dontshowitagain">{i18n.t("page.product.modal.branch.confirm.notaskingagain")}</label>
            </div>
        </div>
    </>);
}



export default ProductSearchInCart;
