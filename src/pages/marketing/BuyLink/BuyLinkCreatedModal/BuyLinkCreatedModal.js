/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 19/10/2020
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React, {useContext, useEffect, useRef, useState} from 'react';
import PropTypes from 'prop-types';
import './BuyLinkCreatedModal.sass'
import ModalHeader from "reactstrap/es/ModalHeader";
import Modal from "reactstrap/es/Modal";
import ModalBody from "reactstrap/es/ModalBody";
import ModalFooter from "reactstrap/es/ModalFooter";
import GSTrans from "../../../../components/shared/GSTrans/GSTrans";
import GSActionButton, {GSActionButtonIcons} from "../../../../components/shared/GSActionButton/GSActionButton";
import GSSearchInput from "../../../../components/shared/GSSearchInput/GSSearchInput";
import i18next from "i18next";
import Loading, {LoadingStyle} from "../../../../components/shared/Loading/Loading";
import Constants from "../../../../config/Constant";
import {CurrencyUtils} from "../../../../utils/number-format";
import {ItemService} from "../../../../services/ItemService";
import {GSToast} from "../../../../utils/gs-toast";
import _ from "lodash";
import GSButton from "../../../../components/shared/GSButton/GSButton";
import GSTable from "../../../../components/shared/GSTable/GSTable";
import {AvField, AvForm} from "availity-reactstrap-validation"
import {FormValidate} from "../../../../config/form-validate";
import {cPromise} from "../../../../utils/promise";
import {CredentialUtils} from "../../../../utils/credential";
import {DISCOUNT_TYPES} from "../../../discounts/DiscountEditor/Editor/DiscountEditor";
import {DiscountStatusEnum} from "../../../../models/DiscountStatusEnum";
import {cn} from "../../../../utils/class-name";
import {BuyLinkService} from "../../../../services/BuyLinkService";
import LoadingScreen from "../../../../components/shared/LoadingScreen/LoadingScreen";
import {BCOrderService} from "../../../../services/BCOrderService";
import {ImageUtils} from "../../../../utils/image";
import {ItemUtils} from "../../../../utils/item-utils";
import {UikSelect} from "../../../../@uik";
import {SEARCH_BY_ENUM} from "../../../products/ProductList/BarcodePrinter/ProductListBarcodePrinter";
import storeService from "../../../../services/StoreService";
import {OrderInStorePurchaseContext} from "../../../order/instorePurchase/context/OrderInStorePurchaseContext";
import i18n from "../../../../config/i18n";

const SCREENS_ENUM = {
    SELECTED_PRODUCT: 'SELECTED_PRODUCT',
    SELECTED_COUPON: 'SELECTED_COUPON'
}

const SIZE_PER_PAGE = 20

const BuyLinkCreatedModal = props => {
    const refTimeout = useRef(null);
    const refFetchPromise = useRef(null);
    const refProductSubmitBtn = useRef(null);

    const [stSelectedProductList, setStSelectedProductList] = useState([]);
    const [stScreen, setStScreen] = useState(SCREENS_ENUM.SELECTED_PRODUCT);

    const [stSearchProductKeyword, setStSearchProductKeyword] = useState('');

    const [stbranchId, setStbranchId] = useState('');

    const [stSearchCouponKeyword, setStSearchCouponKeyword] = useState('');
    const [stPagination, setStPagination] = useState({
        currentPage: 1,
        totalPage: 0,
        itemCount: 0
    });
    const [stIsSearching, setStIsSearching] = useState('');
    const [stShowSearch, setStShowSearch] = useState(false);
    const [stLstProduct, setStLstProduct] = useState([]);
    const [stLstCoupon, setStLstCoupon] = useState([]);
    const [stSelectedCoupon, setStSelectedCoupon] = useState({id: null});
    const [stSearchCouponResult, setStSearchCouponResult] = useState([]);
    const [stIsFinishing, setStIsFinishing] = useState(false);

    const [stFilterBranchBy, setStFilterBranchBy] = useState();
    const {state, dispatch} = useContext(OrderInStorePurchaseContext.context);
    const [stBranches, setStBranches] = useState([]);
    let refConfirmSwitchBranch = useRef(null);


    useEffect(() => {
        fetchCoupon()
    }, [])

    useEffect(() => {
        fetchBranch()
        if (props.model) {
            loadModel()
            fetchBranch(props.model.buyLinkItems[0].branchId)
        }
    }, [props.model])

    useEffect(() => {
        if (stSearchCouponKeyword) {
            // filter by keyword and remove selected coupon
            const cpList = stLstCoupon.filter(cp => {
                return cp.name.toLowerCase().includes(stSearchCouponKeyword.toLowerCase()) && cp.id !== stSelectedCoupon.id
            })
            // add selected coupon on top
            if (stSelectedCoupon.id) {
                cpList.unshift(stSelectedCoupon)
            }
            setStSearchCouponResult(cpList)
        }
    }, [stSearchCouponKeyword])


    useEffect(() => {
        if(!stSearchProductKeyword){
            setStPagination(pagination => ({
                ...pagination,
                totalPage: 0,
                itemCount: 0,
                currentPage: 1
            }))
            setStLstProduct([])
            return;
        }

        clearTimeout(refTimeout.current)
        refTimeout.current = setTimeout( () => {
            setStIsSearching(true)

            const params = {
                keyword: stSearchProductKeyword,
                branchId:stbranchId,
                locationCode: 'VN',
                sort: 'PRICE_ASC'
            }

            if (refFetchPromise.current) {
                refFetchPromise.current.cancel()
            }

            refFetchPromise.current = cPromise(ItemService.getProductSuggestionByName(
                stPagination.currentPage - 1, //page
                SIZE_PER_PAGE, // size
                'PRODUCT_NAME',
                params.keyword,
                true,
                params.branchId,
                {platform: 'WEB', includeConversion: true}
            ))


            refFetchPromise.current.promise.then(result => {
                setStLstProduct(separateModel(result.data))
                setStPagination(stPagination => ({
                    ...stPagination,
                    totalPage: Math.ceil(parseInt(result.headers['x-total-count']) / SIZE_PER_PAGE),
                    itemCount: parseInt(result.headers['x-total-count']),
                    currentPage: 1
                }))
                setStIsSearching(false)

            }).catch(e => {
                setStIsSearching(false)
                if (!e.isCanceled) {
                    GSToast.commonError()
                }
            })

        }, 300)


    }, [stSearchProductKeyword])


    useEffect( () => {

        if(stPagination.currentPage <= 1){
            return;
        }
        setStIsSearching(true)

        const params = {
            keyword: stSearchProductKeyword,
            branchId:stbranchId,
            locationCode: 'VN',
            sort: 'PRICE_ASC'
        }

        if (refFetchPromise.current) {
            refFetchPromise.current.cancel();
        }

        refFetchPromise.current = cPromise(ItemService.getProductSuggestionByName(
            stPagination.currentPage - 1, //page
            SIZE_PER_PAGE, // size
            'PRODUCT_NAME',
            params.keyword,
            true,
            params.branchId,
            {
                platform: 'WEB', 
                includeConversion: true
            },
            
        ))

        refFetchPromise.current.promise.then(result => {
            // separate model to new row before add to list
            let resultList = separateModel(result.data)


            if (stPagination.currentPage === 1) { // => if this is first page -> clear all previous list
                setStLstProduct(resultList)
            } else { // => if this is not first page -> append to previous list
                setStLstProduct(lstProduct => [...lstProduct, ...resultList])
            }

            setStPagination({
                ...stPagination,
                totalPage: Math.ceil(parseInt(result.headers['x-total-count']) / SIZE_PER_PAGE),
                itemCount: parseInt(result.headers['x-total-count'])
            })
            setStIsSearching(false)

        }).catch(e => {
            setStIsSearching(false)
            GSToast.commonError()
        })

    }, [stPagination.currentPage])


    const fetchBranch = async (branchId) => {
        try {
            const result = await storeService.getActiveStoreBranches();
            if(result) {
                const branches = result.map((branch) => {
                    return {value: branch.id, label: branch.name};
                })
                //in case staff login without default branch in there
                if (branchId){
                    setStFilterBranchBy({value: branchId});
                }else {
                    setStFilterBranchBy({value: branches[0].value});
                }
                if(!stFilterBranchBy) {
                    setStbranchId(branches[0].value)
                }
                setStBranches(branches);
            }
        } catch(e) {
            GSToast.commonCreate();
        }
    }


    const fetchCoupon = (keyword, page = 0) => {
        const params = {
            page: page,
            size: 999,
            storeId: CredentialUtils.getStoreId(),
            sort: 'lastModifiedDate,desc',
            type: DISCOUNT_TYPES.PROMOTION_PRODUCT,
            status: DiscountStatusEnum.IN_PROGRESS,
            // discountName: keyword
        }
        BCOrderService.getDiscounts(params)
            .then(result => {
                setStLstCoupon(result.data)
            })
    }

    const scrollProductList = (e) => {
        const bottom = isBottom(e.currentTarget)
        if (bottom && stPagination.currentPage < stPagination.totalPage && !stIsSearching) {
            setStPagination({
                ...stPagination,
                currentPage: stPagination.currentPage + 1
            })
            setStIsSearching(true)
        }
    }



    const openProductList = () => {
        setStShowSearch(true)

    }





    const isBottom = (el) => {
        let afterCal = Math.floor(el.scrollHeight - el.scrollTop);
        return afterCal <= el.clientHeight;
    }

    const closeProductList = () => {
        setStShowSearch(false)


    }

    const separateModel = (productList) => {
        let resultList = _.cloneDeep(productList).map(p => ({
            ...p,
            name: p.itemName,
            image: p.itemImage
        }))
        return resultList
    }

    const onSearch = () => {
        setStIsSearching(true)
        const params = {
            keyword: stSearchProductKeyword,
            branchId:stbranchId,
            locationCode: 'VN',
            sort: 'PRICE_ASC'
        }



        ItemService.getProductSuggestionByName(
            stPagination.currentPage - 1, //page
            SIZE_PER_PAGE, // size
            'PRODUCT_NAME',
            params.keyword,
            true,
            params.branchId

        ).then(result => {
            setStLstProduct(separateModel(result.data))
            setStPagination(stPagination => ({
                ...stPagination,
                totalPage: Math.ceil(parseInt(result.headers['x-total-count']) / SIZE_PER_PAGE),
                itemCount: parseInt(result.headers['x-total-count']),
                currentPage: 1
            }))
            setStIsSearching(false)

        }).catch(e => {
            setStIsSearching(false)
            GSToast.commonError()
        })
    }

    const selectProduct = (product) => {
        if(product.parentId){
            GSToast.error('message.not.allow.to.create.buy.link.for.conversion.unit.at.this.time', true)
            setStShowSearch(false)
            return
        }
        product.checked = true
        product.quantity = 1
        product.id = product.id || product.itemId
        // temp product list
        const productList = _.cloneDeep(stSelectedProductList)
        const existedProduct = productList.find(p => p.id == product.id)
        if (existedProduct) {
            existedProduct.quantity = parseInt(existedProduct.quantity) + 1
        } else {
            productList.unshift(product)
        }

        if (productList.length > 10) {
            GSToast.error('page.buyLink.createdModal.max.errMsg', true)
            setStShowSearch(false)
            return
        }

        setStSelectedProductList(productList)
        setStShowSearch(false)
    }


    const onClickRemoveProduct = (id) => {
        let productList = _.cloneDeep(stSelectedProductList)
        productList= productList.filter(p => p.id != id)
        setStSelectedProductList(productList)
    }

    const onClickProductNextBtn = () => {
        setStShowSearch(false)
        refProductSubmitBtn.current.click()
    }

    const onValidProductFormSubmit = (e, values) => {
        setStScreen(SCREENS_ENUM.SELECTED_COUPON)
    }

    const onBlurProductQuantity = (e) => {
        const quantity = e.currentTarget.value
        const pId = getProductIdFromInputName(e.currentTarget.name)
        let productList = _.cloneDeep(stSelectedProductList)
        const updatedProduct = productList.find(p => p.id == pId)
        updatedProduct.quantity = quantity
        setStSelectedProductList(productList)
    }


    const getProductIdFromInputName = (inputName) => {
        return inputName.replace('quantity', '')
    }

    const onClickBack = () => {
        setStScreen(SCREENS_ENUM.SELECTED_PRODUCT)
    }

    const renderSelectedCouponSymbol = (coupon) => {
        if (coupon.id === stSelectedCoupon.id) {
            return (
                <img src="/assets/images/ic_successful.svg"/>
            )
        }
        return <div className="blank-checked"></div>
    }

    const onClickSelectedCoupon = (coupon) => {
        setStSelectedCoupon(coupon)
    }

    const onClickClose = () => {
        props.onClose()
        // reset
        setStSelectedCoupon({id: null})
        setStSelectedProductList([])
        setStSearchCouponResult([])
        setStSearchCouponKeyword('')
        setStSearchProductKeyword('')
        setStShowSearch(false)
        setStScreen(SCREENS_ENUM.SELECTED_PRODUCT)
    }

    const onClickFinish = () => {
        setStIsFinishing(true)
        const requestBody = buildRequestBody()
        if (props.model) {
            BuyLinkService.updateBuyLink(requestBody)
                .then(result => {
                    GSToast.commonUpdate()
                    onClickClose()
                })
                .catch(()=> {
                    GSToast.commonError()
                })
                .finally(() => {
                    setStIsFinishing(false)
                })
        } else {
            BuyLinkService.createBuyLink(requestBody)
                .then(result => {
                    GSToast.commonCreate()
                    onClickClose()
                })
                .catch(()=> {
                    GSToast.commonError()
                })
                .finally(() => {
                    setStIsFinishing(false)
                })
        }

    }

    /**
     * @return GsBuyLinkModel
     */
    const buildRequestBody = () => {
        /**
         * @type GsBuyLinkModel
         */
        const requestBody = {

            buyLinkItems: stSelectedProductList.map(p => ({
                itemId: p.itemId,
                modelId: p.modelId,
                quantity: p.quantity,
                branchId:stbranchId
            })),
            couponCode: stSelectedCoupon.id !== null? stSelectedCoupon.discounts[0].couponCode: undefined,
            discountCampaignId: stSelectedCoupon.id !== null? stSelectedCoupon.id: undefined,
            storeId: CredentialUtils.getStoreId()
        }
        if (props.model) {
            requestBody.id = props.model.id
        }
        return requestBody
    }

    const loadModel = () => {
        /**
         * @type GsBuyLinkModel
         **/
        const model = props.model
        if (!model) return

        const itemIdList = model.buyLinkItems.filter(i => i.itemId).map(i => i.itemId)

        ItemService.getItemListByIdList(itemIdList)
            .then(async orgItemList => {
                const fProductList = []
                for (const blItem of model.buyLinkItems) {
                    try {
                        const itemId = blItem.itemId
                        const modelId = blItem.modelId
                        const foundOrgItem = orgItemList.find(item => item.id == itemId)

                        const fItem = {
                            ...foundOrgItem,
                            quantity: blItem.quantity,
                            id: modelId? itemId + '-' + modelId:itemId,
                            itemImage: ImageUtils.getImageFromImageModel(foundOrgItem.images[0]),
                            itemName: foundOrgItem.name,
                            itemId
                        }

                        if (modelId) {
                            const res = await ItemService.getItemModelById(modelId)
                            fItem.modelName = ItemUtils.buildModelNameArray(res.variationValue)
                            fItem.modelId = modelId
                        }

                        fProductList.push(fItem)
                    } catch (e) {
                    }
                }

                setStSelectedProductList(separateModel(fProductList))

                if (model.discountCampaignId) {
                    BCOrderService.getCouponDetail(model.discountCampaignId)
                        .then(coupon => {
                            setStSelectedCoupon(coupon)
                        })
                }
            })
    }





    const onClickDontShowItAgain = (isChecked) => {
        if(isChecked) {
            return localStorage.setItem(Constants.UTILITY.ORDER_CONFIRM_MODAL_SWITCH_BRANCH_NOT_SHOW, true);
        }
        return localStorage.removeItem(Constants.UTILITY.ORDER_CONFIRM_MODAL_SWITCH_BRANCH_NOT_SHOW, false);
    }

    const onSwitchBranch = (e) => {
        setStFilterBranchBy(e)
        setStbranchId(e.value)
        setStSelectedProductList([])
        Array.from(document.querySelectorAll(".clear-input")).forEach(
            input => (input.value = '')
        );
        setStSearchProductKeyword('')
    }



    return (
        <>
            {stIsFinishing && <LoadingScreen loadingStyle={LoadingStyle.ELLIPSIS_GREY} zIndex={1060}/>}
        <Modal isOpen={props.isOpen} contentClassName={cn('buy-link-created-modal',
            {'buy-link-created-modal__w-product': stScreen === SCREENS_ENUM.SELECTED_PRODUCT},
            {'buy-link-created-modal__w-coupon': stScreen === SCREENS_ENUM.SELECTED_COUPON},
            )}>
            <ModalHeader className="text-left" children={
                <>
                    {stScreen === SCREENS_ENUM.SELECTED_PRODUCT &&
                        <GSTrans t="page.shopee.product.selectProduct.title"/>
                    }
                    {stScreen === SCREENS_ENUM.SELECTED_COUPON &&
                        <GSTrans t="page.buyLink.createdModal.selectPromotion"/>
                    }

                    {stScreen === SCREENS_ENUM.SELECTED_PRODUCT &&
                    <span className="customer-list-barcode-printer__selected font-size-14px font-weight-normal">
                            {stSelectedProductList.length > 0 && <>
                                <GSTrans t="page.buyLink.createdModal.selectedProduct"
                                         values={{current: stSelectedProductList.length, total: 10}}>
                                    0<b>1</b>
                                </GSTrans>
                            </>}
                        <GSActionButton icon={GSActionButtonIcons.CLOSE}
                                        width={'1rem'}
                                        style={{marginLeft: '1rem'}}
                                        onClick={onClickClose}
                        />
                    </span>}
                </>
            }>

            </ModalHeader>
            <ModalBody>
                {stScreen === SCREENS_ENUM.SELECTED_PRODUCT &&
                    <>
                    <div className="d-flex align-items-center flex-md-row flex-column position-relative buy-link-created-modal__search-wrapper">
                        <GSSearchInput
                           liveSearchOnMS={500}
                           onSearch={setStSearchProductKeyword}
                           onChange={e => setStSearchProductKeyword(e.currentTarget.value)}
                           className="flex-grow-1 clear-input"
                           style={{
                               height: '38px',
                           }}
                           wrapperProps={{
                               style: {
                                   height: '38px',
                                   width: '100%',
                                   marginRight: '.25rem'
                               }
                           }}
                           onClick={openProductList}
                           defaultValue={stSearchProductKeyword}
                           placeholder={i18next.t("page.product.list.printBarCode.searchByProduct")}
                        />

                        <div className="branch__product"  onClick={closeProductList}>
                            <img src="/assets/images/buylink/icon_store.svg"
                                className="gs-widget-empty-content__icon" 
                                alt=""
                            />
                            <UikSelect
                                onChange={onSwitchBranch}
                                position={'bottomRight'}
                                value={[stFilterBranchBy]}

                                style={{
                                    width: '100px',
                                    marginLeft: "10px"
                                }}
                                options={stBranches}
                            />
                        </div>


                        <div className="dropdown-menu dropdown-menu-right search-list__result font-weight-normal"
                             hidden={!stShowSearch}
                             style={{display: 'block', top: '0px'}}
                             onScroll={scrollProductList}
                             onBlur={closeProductList}
                        >

                            {stLstProduct.map((product, index) => {
                                return (
                                    <div
                                        key={product.id}
                                        className={[
                                            "product-item-row gsa-hover--gray gs-atm__scrollbar-1",
                                            product.parentId ? "bg-light-gray" : ""
                                        ].join(' ')}
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

                                        </div>
                                        <div className="product-item-row__price d-flex flex-column">
                                            <div>{CurrencyUtils.formatMoneyByCurrency(product.price, product.currency)}</div>
                                            {product.conversionUnitName && (
                                                <div className='text-primary'>
                                                    <GSTrans t="component.product.addNew.unit.title"/>: {' '}
                                                    {product.conversionUnitName}
                                                </div>
                                            )}
                                            
                                        </div>
                                    </div>
                                )
                            })}


                            <div className="product-item-row product-item-row__lastchild"
                                 style={{
                                     height: '50px',
                                     // display: stLstProduct.length === 0? 'flex':'none'
                                 }}
                            >

                                {stIsSearching && <Loading style={LoadingStyle.ELLIPSIS_GREY}/>}
                                {
                                    (!stIsSearching && (!stLstProduct || stLstProduct.length === 0 ) && stSearchProductKeyword) &&
                                    i18next.t('page.order.create.product.search.not_found')
                                }
                                {
                                    (!stIsSearching && (!stLstProduct || stLstProduct.length === 0 ) && !stSearchProductKeyword) &&
                                    i18next.t('page.order.create.product.search.not_input')
                                }
                            </div>

                        </div>
                    </div>
                    <div className="buy-link-created-modal__selected-product">
                        {stSelectedProductList.length === 0 &&
                            <div className="w-100 h-100 d-flex justify-content-center align-items-center flex-column">
                                <img src="/assets/images/icon-buy-link-empty.svg"
                                     width="100px"
                                     height="100px"
                                     className="mb-3"
                                     alt="empty"/>
                                <GSTrans t="page.buyLink.createdModal.emptyHint"/>
                            </div>

                        }
                        {stSelectedProductList.length > 0 &&
                            <AvForm onValidSubmit={onValidProductFormSubmit}>
                                <button ref={refProductSubmitBtn} hidden></button>
                                <GSTable>
                                    <thead>
                                    <tr>
                                        <th>
                                            <GSTrans t="component.product.addNew.productInformation.name"/>
                                        </th>
                                        <th className="text-center">
                                            <GSTrans t="page.dashboard.table.quantity"/>
                                        </th>
                                        <th>
                                            <GSTrans t="component.product.addNew.unit.title"/>
                                        </th>
                                        <th>

                                        </th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {stSelectedProductList.map((p) => {
                                        return (
                                            <>
                                                <tr key={p.id}>
                                                    <td className="w-100">
                                                        <div className="d-flex align-items-center">
                                                            <img src={p.itemImage}
                                                                 width="48px"
                                                                 height="48px"
                                                                 alt="product-thumbnail"
                                                                 className="mr-2"
                                                            />
                                                            <div className="d-flex justify-content-center flex-column">
                                                                <h6 className="product-item-row__product-name mb-0">
                                                                    {p.name}
                                                                </h6>
                                                                {p.modelName &&
                                                                <span className="product-item-row__variation-name">
                                                                        {p.modelName.replace('|' + Constants.DEPOSIT_CODE.FULL, '')}
                                                                </span>
                                                                }
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="buy-link-created-modal__td-quantity">
                                                        <AvField type="number"
                                                                 name={'quantity' + p.id}
                                                                 className="clear-up-down-btn"
                                                                 style={{
                                                                     width: '5rem',
                                                                     paddingRight: '.5rem !important'
                                                                 }}
                                                                validate={{
                                                                    ...FormValidate.maxValue(999, false, 'page.buyLink.createdModal.quantity.validated.max'),
                                                                    ...FormValidate.minValue(1, false, 'page.buyLink.createdModal.quantity.validated.min')
                                                                }}
                                                                 value={parseInt(p.quantity)}
                                                                 onBlur={onBlurProductQuantity}
                                                        />
                                                    </td>
                                                    <td className='text-capitalize text-center'>
                                                        {p.conversionUnitName ? p.conversionUnitName : '-'}
                                                    </td>
                                                    <td style={{width: '2rem'}}>
                                                        <GSActionButton icon={GSActionButtonIcons.DELETE} onClick={() => onClickRemoveProduct(p.id)}/>
                                                    </td>
                                                </tr>
                                            </>
                                        )
                                    })}
                                    </tbody>
                                </GSTable>
                            </AvForm>

                        }
                    </div>
                </>
                }

                {stScreen === SCREENS_ENUM.SELECTED_COUPON &&
                    <>
                    <div className="d-flex align-items-center flex-md-row flex-column position-relative buy-link-created-modal__search-wrapper">
                        <GSSearchInput
                            liveSearchOnMS={500}
                            onSearch={setStSearchCouponKeyword}
                            onChange={e => setStSearchCouponKeyword(e.currentTarget.value)}
                            className="flex-grow-1"
                            style={{
                                height: '38px',
                            }}
                            wrapperProps={{
                                style: {
                                    height: '38px',
                                    width: '100%',
                                    marginRight: '.25rem'
                                }
                            }}
                            defaultValue={stSearchCouponKeyword}
                            placeholder={i18next.t("component.discount.input.placeholder.search")}
                        />
                    </div>
                        <div className="buy-link-created-modal__selected-product p-2 d-flex flex-column align-items-center">
                            {stLstCoupon.length > 0 &&
                            <div className="buy-link-created-modal__coupon-row gsa-hover--gray cursor--pointer"
                                  onClick={() => onClickSelectedCoupon({id: null})}
                            >
                                {renderSelectedCouponSymbol({id: null})}
                                <h6 className="mt-0">
                                    <GSTrans t="page.buyLink.createdModal.selectNone"/>
                                </h6>
                            </div>
                            }
                            {stSearchCouponKeyword === '' && stLstCoupon.map(coupon => {
                                return (
                                    <div className="buy-link-created-modal__coupon-row gsa-hover--gray cursor--pointer"
                                         key={coupon.id}
                                    onClick={() => onClickSelectedCoupon(coupon)}>
                                        {renderSelectedCouponSymbol(coupon)}
                                        <div>
                                            <h6>
                                                {coupon.name}
                                            </h6>
                                            <strong>
                                                <code>
                                                    {coupon.discounts[0].couponCode.toUpperCase()}
                                                </code>
                                            </strong>
                                        </div>

                                    </div>
                                )
                            })}
                            {stSearchCouponKeyword !== '' && stSearchCouponResult.map(coupon => {
                                return (
                                    <div className="buy-link-created-modal__coupon-row gsa-hover--gray cursor--pointer"
                                         key={"sr" + coupon.id}
                                         onClick={() => onClickSelectedCoupon(coupon)}>
                                        {renderSelectedCouponSymbol(coupon)}
                                        <div>
                                            <h6>
                                                {coupon.name}
                                            </h6>
                                            <strong>
                                                <code>
                                                    {coupon.discounts[0].couponCode.toUpperCase()}
                                                </code>
                                            </strong>
                                        </div>

                                    </div>
                                )
                            })
                            }
                            {/*Have no coupon*/}
                            {stLstCoupon.length === 0 &&
                            <div className="w-100 flex-grow-1 d-flex justify-content-center align-items-center">
                                <GSTrans t="page.buyLink.createdModal.emptyCoupon"/>
                            </div>
                            }
                        </div>

                    </>
                }

            </ModalBody>

            <ModalFooter>
                {stScreen === SCREENS_ENUM.SELECTED_PRODUCT &&
                    <>
                        <GSButton secondary outline marginRight onClick={onClickClose}>
                            <GSTrans t={"common.btn.cancel"}/>
                        </GSButton>

                        <GSButton success disabled={stSelectedProductList.length === 0} onClick={onClickProductNextBtn}>
                            <GSTrans t={"common.btn.next"}/>
                        </GSButton>
                    </>
                }
                {stScreen === SCREENS_ENUM.SELECTED_COUPON &&
                    <>
                        <GSButton secondary outline marginRight onClick={onClickBack}>
                            <GSTrans t={"common.btn.back"}/>
                        </GSButton>

                        <GSButton success onClick={onClickFinish}>

                            <GSTrans t={props.model? "common.btn.update":"common.btn.finish"}/>
                        </GSButton>
                    </>
                }
            </ModalFooter>
        </Modal>
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

BuyLinkCreatedModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func,
    /**
     * @type GsBuyLinkModel
     */
    model: PropTypes.object,
};

export default BuyLinkCreatedModal;
