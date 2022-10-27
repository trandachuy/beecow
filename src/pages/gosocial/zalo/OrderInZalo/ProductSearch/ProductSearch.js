/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 15/01/2020
 * Author: Tien Dao <tien.dao@mediastep.com>
 *******************************************************************************/
import React, {useContext, useEffect, useRef, useState} from 'react';
import './ProductSearch.sass';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import i18next from "i18next";
import _ from 'lodash';
import {useRecoilState, useRecoilValue} from "recoil";
import {SEARCH_BY_ENUM} from "../../../../products/ProductList/BarcodePrinter/ProductListBarcodePrinter";
import {TokenUtils} from "../../../../../utils/token";
import {ItemService} from "../../../../../services/ItemService";
import {GSToast} from "../../../../../utils/gs-toast";
import AlertModal from "../../../../../components/shared/AlertModal/AlertModal";
import {ItemUtils} from "../../../../../utils/item-utils";
import {CurrencyUtils} from "../../../../../utils/number-format";
import Loading, {LoadingStyle} from "../../../../../components/shared/Loading/Loading";
import ConfirmModal from "../../../../../components/shared/ConfirmModal/ConfirmModal";
import {UikInput, UikSelect} from '../../../../../@uik';
import {OrderInZaloContext} from "../../context/OrderInZaloContext";
import {OrderInZaloContextService} from "../../context/OrderInZaloContextService";
import {OrderInZaloRecoil} from "../../recoil/OrderInZaloRecoil";

const SIZE_PER_PAGE = 10

const ProductSearch = props => {
    const storeBranch = useRecoilValue(OrderInZaloRecoil.storeBranchState)
    const getWidthSeach = useRef(null)

    const {state, dispatch} = useContext(OrderInZaloContext.context);
    const refTimeout = useRef(null);
    let refConfirmSwitchBranch = useRef(null);
    let refStaffConfirm = useRef(null);
    const onSearch = useRef(false);
    const [isSearching, setIsSearching] = useState(false);
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

    const [posScannerState, setPosScannerState] = useRecoilState(OrderInZaloRecoil.posScannerState)

    useEffect(() => {
        // fetchBranch();
    },[])

    useEffect( () => {
        clearTimeout(refTimeout.current)
        refTimeout.current = setTimeout(searchProduct, 400);
    }, [state.searchProductText, stSearchBy.value, storeBranch])

    // for scroll
    useEffect( () => {
        if(pagination.currentPage <= 1){
            return;
        }

        scrollFindProduct();
    }, [pagination.currentPage])

    const searchProduct = () => {

        if(TokenUtils.isStaff() && !storeBranch) {
            //without search if staff doesn't has branch
            return;
        }
        setIsSearching(true)


        const params = {
            keyword: state.searchProductText,
            locationCode: 'VN',
            sort: 'PRICE_ASC',
            branchId: storeBranch.value,
            platform: 'IN_GOSOCIAL'
        }

        ItemService.getProductSuggestionByName(
            0, //page
            SIZE_PER_PAGE, // size
            stSearchBy.value,
            params.keyword,
            true,
            params.branchId,
            {
                platform: params.platform,
                includeConversion: true
            }
        ).then(result => {
            setLstProduct(ItemUtils.sortByParentId(separateModel(result.data)))
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

        if(TokenUtils.isStaff() && !storeBranch) {
            //without search if staff doesn't has branch
            return;
        }

        setIsSearching(true)

        const params = {
            keyword: state.searchProductText,
            locationCode: 'VN',
            sort: 'PRICE_ASC',
            branchId: storeBranch.value
        }

        ItemService.getProductSuggestionByName(
            pagination.currentPage - 1, //page
            SIZE_PER_PAGE, // size
            stSearchBy.value,
            params.keyword,
            true,
            params.branchId,
            {
                platform: 'IN_GOSOCIAL',
                includeConversion: true
            }
        ).then(result => {
            // separate model to new row before add to list
            let resultList = ItemUtils.sortByParentId(separateModel(result.data))

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

    const onInputSearch = (event) => {
        const keyword = event.currentTarget.value
        dispatch(OrderInZaloContext.actions.setSearchProductText(keyword))
        // setTextSearch(keyword)
    }

    const scrollProductList = _.debounce((el) => {
        const bottom = isBottom(el)
        if (bottom && pagination.currentPage < pagination.totalPage && !isSearching) {
            setPagination({
                ...pagination,
                currentPage: pagination.currentPage + 1
            })
            setIsSearching(true)
        }
    }, 300)

    const isBottom = (el) => {
        let afterCal = Math.floor(el.scrollHeight - el.scrollTop);
        console.debug(afterCal, el.clientHeight)
        return afterCal <= (el.clientHeight + 1);
    }

    const selectProduct = (product) => {
        let clonedProduct = _.cloneDeep(product)
        clonedProduct.checked = true
        clonedProduct.quantity = 1
        clonedProduct.id = product.id? product.id:product.itemId
        clonedProduct.branchId = storeBranch.value;
        clonedProduct.dateSelected = new Date()
        dispatch(OrderInZaloContext.actions.addNewProduct(clonedProduct))
        // temp product list
        const productList = _.cloneDeep(state.productList)
        const existedProduct = productList.find(p => p.id === product.id)
        if (existedProduct) {
            existedProduct.quantity = parseInt(existedProduct.quantity) + 1
        } else {
            productList.unshift(clonedProduct)
        }

        OrderInZaloContextService.dispatchUpdateProductList(state, dispatch, productList, storeBranch)
        setshowSearch(false)
    }

    const openProductList = () => {
    	if(!state.searchProductText && pagination.currentPage === 1){
            searchProduct();
        }
        setshowSearch(true)

        setPosScannerState(state => ({
            ...state,
            shouldScannerActivated: false,
            customerScannerState: false
        }))
    }

    const closeProductList = (e) => {
        if(e.relatedTarget && e.relatedTarget.classList && e.relatedTarget.classList.contains('product-item-row')){
            setshowSearch(true)
        }else{
            setshowSearch(false)
        }

        setPosScannerState(state => ({
            ...state,
            shouldScannerActivated: true,
            scannerState: true
        }))
    }

    const onChangeSearchBy = (e) => {
        setStSearchBy(e);
    }


    return (
        <>
            <AlertModal ref={(el) => {
                    refStaffConfirm = el;
            }}/>
            <div className="order-instore-facebook">
                {/* Text-box search */}
                <div className="d-flex align-items-center">
                    <div style={{marginRight: 'auto'}}
                         className="search-box__wrapper"
                        // data-toggle="dropdown"
                        // aria-haspopup="true"
                        // aria-expanded="false"
                         ref={getWidthSeach}
                         onClick={openProductList}
                         onBlur={closeProductList}
                         id="dropdownSuggestionProduct"
                    >
                        <UikInput
                            onChange={onInputSearch}
                            icon={(
                                <FontAwesomeIcon icon="search"/>
                            )}
                            placeholder={i18next.t(stSearchBy.value === SEARCH_BY_ENUM.PRODUCT? "page.product.list.printBarCode.searchByProduct": stSearchBy.value === SEARCH_BY_ENUM.SKU?  "page.product.list.printBarCode.searchBySKU" :"page.product.list.printBarCode.searchByBarcode")}
                            value={state.searchProductText}
                        />
                    </div>
                    <div style={{marginLeft: "10px"}}>
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
                                    label: i18next.t('inventoryList.tbheader.variationName'),
                                },
                                {
                                    value: SEARCH_BY_ENUM.SKU,
                                    label: i18next.t('page.product.list.printBarCode.sku'),
                                },
                                {
                                    value: SEARCH_BY_ENUM.BARCODE,
                                    label: i18next.t('page.product.list.printBarCode.barcode'),
                                }
                            ] }
                        />
                    </div>
                </div>

                {
                    <div
                        hidden={!showSearch}
                        style={{display: 'block', top: '12.5px', width:`${getWidthSeach.current?.offsetWidth}px`}}
                        className="dropdown-menu dropdown-menu-right search-list-pos__result font-weight-normal"
                        onScroll={e => scrollProductList(e.currentTarget)}
                        onBlur={closeProductList}>

                            {lstProduct.map(product => {
                                return (
                                    <div
                                        key={product.id}
                                        className={[
                                        "product-item-row gsa-hover--gray gs-atm__scrollbar-1",
                                        product.parentId ? "conversion-item" : ""
                                    ].join(' ')}
                                        onClick={() => selectProduct(product)}
                                        tabIndex={0}
                                    >
                                        {
                                            product.image &&
                                            <img src={product.image}
                                             alt="product-thumbnail"
                                             className="product-item-row__thumbnail"
                                            />
                                        }

                                        {
                                            !product.image &&
                                            <img src={"/assets/images/default_image.png"}
                                             alt="product-thumbnail"
                                             className="product-item-row__thumbnail"
                                            />
                                        }
                                        <div className="product-item-row__product-summary">
                                            <h6 className="product-item-row__product-name mb-0">
                                                {product.name}
                                            </h6>
                                            {product.modelName &&
                                            <span className="product-item-row__variation-name">
                                                    {ItemUtils.escape100Percent(product.modelName).replace(/\|/gm, ' | ')}
                                            </span>
                                            }
                                            <div>
                                                <code className="color-gray">{product.barcode}</code>
                                            </div>
                                        </div>
                                        <div className="product-item-row__product-inventory">
                                            <span className='text-left'>{CurrencyUtils.formatMoneyByCurrency(product.price, CurrencyUtils.getLocalStorageSymbol())}</span>
                                            <span><span>{i18next.t('page.transfer.stock.table.column.inventory')} : </span> {product.itemStock}</span>
                                            {
                                                product.conversionUnitName && <span className='unit'><span>{i18next.t('page.transfer.stock.table.column.unit')} : </span> {product.conversionUnitName}</span>
                                            }
                                        </div>
                                    </div>
                                )
                            })}


                            <div className="product-item-row product-item-row__lastchild"
                                style={{
                                    height: '200px',
                                    display: lstProduct.length === 0? 'flex':'none'
                                }}
                            >

                                {isSearching && <Loading style={LoadingStyle.ELLIPSIS_GREY}/>}
                                {
                                    (!isSearching && (!lstProduct || lstProduct.length === 0 ) && state.searchProductText) &&
                                    <div className="d-flex flex-column">
                                        <img className="ml-1" width="50px" src="/assets/images/search-not-found.png"/>
                                        <p>{i18next.t("page.order.create.product.search.notFound")}</p>
                                    </div>
                                }
                                {
                                    (!isSearching && (!lstProduct || lstProduct.length === 0 ) && !state.searchProductText) &&
                                    <div className="d-flex flex-column">
                                        <img className="ml-1" width="50px" src="/assets/images/search-not-found.png"/>
                                        <p>{i18next.t("page.order.create.product.search.notFound")}</p>
                                    </div>
                                }
                            </div>

                    </div>
                }

            </div>

            <ConfirmModal
                ref={(el) => {
                    refConfirmSwitchBranch = el;
            }}/>
        </>
    );
};

export default ProductSearch;
