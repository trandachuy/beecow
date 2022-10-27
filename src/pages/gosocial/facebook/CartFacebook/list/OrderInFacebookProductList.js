/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 15/01/2020
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React, {useContext, useEffect, useRef, useState} from 'react';
import './OrderInFacebookProductList.sass';
import PropTypes from 'prop-types';
import GSTrans from "../../../../../components/shared/GSTrans/GSTrans";
import {UikCheckbox, UikWidgetTable} from '../../../../../@uik';
import {CurrencyUtils} from "../../../../../utils/number-format";
import GSActionButton, {GSActionButtonIcons} from "../../../../../components/shared/GSActionButton/GSActionButton";
import ConfirmModal from "../../../../../components/shared/ConfirmModal/ConfirmModal";
import {Trans} from "react-i18next";
import _ from 'lodash';
import GSComponentTooltip, {GSComponentTooltipPlacement} from "../../../../../components/shared/GSComponentTooltip/GSComponentTooltip";
import i18next from "i18next";
import {GSAlertModalType} from "../../../../../components/shared/GSAlertModal/GSAlertModal";
import AlertModal from "../../../../../components/shared/AlertModal/AlertModal";
import ModalHeader from "reactstrap/es/ModalHeader";
import ModalBody from "reactstrap/es/ModalBody";
import {AvField, AvForm} from "availity-reactstrap-validation";
import {ItemUtils} from "../../../../../utils/item-utils";
import AvFieldCurrency from "../../../../../components/shared/AvFieldCurrency/AvFieldCurrency";
import {CurrencySymbol} from "../../../../../components/shared/form/CryStrapInput/CryStrapInput";
import {FormValidate} from "../../../../../config/form-validate";
import ModalFooter from "reactstrap/es/ModalFooter";
import GSButton from "../../../../../components/shared/GSButton/GSButton";
import {Modal} from "reactstrap";
import {ItemService} from "../../../../../services/ItemService";
import {GSToast} from "../../../../../utils/gs-toast";
import GSTable from "../../../../../components/shared/GSTable/GSTable";
import {useRecoilValue} from "recoil";
import LoadingScreen from "../../../../../components/shared/LoadingScreen/LoadingScreen";
import {FbMessengerContext} from "../../context/FbMessengerContext";
import {OrderInFacebookContextService} from "../../context/OrderInFacebookContextService";
import Constants from '../../../../../config/Constant';
import {TokenUtils} from '../../../../../utils/token';
import storeService from '../../../../../services/StoreService';
import storageService from "../../../../../services/storage";
import {BCOrderService} from "../../../../../services/BCOrderService";
import {OrderInStorePurchaseContextService} from "../../../../order/instorePurchase/context/OrderInStorePurchaseContextService";
import {OrderInStorePurchaseContext} from '../../../../order/instorePurchase/context/OrderInStorePurchaseContext'
import {OrderInFacebookRecoil} from "../../recoil/OrderInFacebookRecoil";
const OrderInFacebookProductList = props => {
    const {state, dispatch} = useContext(FbMessengerContext.context);
    const refConfirmRemove = useRef(null);
    const refAlertModal = useRef();
    const storeBranch = useRecoilValue(OrderInFacebookRecoil.storeBranchState)
    const tabIndex = useRecoilValue(OrderInFacebookRecoil.currentOrderIndexState)
    const isCheckedAll = state.productList.filter(p => p.checked).length === state.productList.length && state.productList.length > 0

    useEffect(() => {
        OrderInFacebookContextService.dispatchUpdateProductList(state, dispatch, state.productList, storeBranch)
    }, [state.checkWholeSalePrice, state.profileId])

    const onClickCheckAll = () => {
        if (isCheckedAll) {
            dispatch(FbMessengerContext.actions.uncheckAllProduct())
        } else {
            dispatch(FbMessengerContext.actions.checkAllProduct())
        }
    }
    const openRemoveConfirmModal = (productId) => {
        const handleOkCallback = () => {
            dispatch(FbMessengerContext.actions.removeProduct(productId))
            const productListAfterRemove = [...state.productList].filter(p => p.id !== productId)
            OrderInFacebookContextService.dispatchUpdateProductList(state, dispatch, productListAfterRemove, storeBranch)
            dispatch(FbMessengerContext.actions.clearInsufficientErrorGroup(productListAfterRemove))
        }
        refConfirmRemove.current.openModal({
            messages: (<Trans i18nKey={"page.order.create.cart.table.confirmDelete"}/>),
            okCallback: handleOkCallback
        })
    }
    useEffect(() => {
        if (state.isNotFound !== undefined) {
            notifyPopup()
        }
    }, [state.isNotFound])
    const notifyPopup = () => {
        refAlertModal.current.openModal({
            type: GSAlertModalType.ALERT_TYPE_INFO,
            messages: (<GSTrans t="productList.scan.by.barcode.notfound"
                                values={{x: state.barcodeScanned}}>
            </GSTrans>),
            modalTitle: i18next.t('common.txt.alert.modal.title'),
            modalBtn: i18next.t('common.btn.alert.modal.close')
        });
    }
    return (
        <>
            <AlertModal ref={refAlertModal}/>
            <ConfirmModal ref={refConfirmRemove}/>
            <div className="order-in-facebook-cart-product-list gs-atm__scrollbar-1 h-100">
                <GSTable>
                    <thead className="">
                    <tr>
                        <th className="p-2" hidden>
                            <UikCheckbox className="mb-0"
                                         checked={isCheckedAll}
                                         onClick={onClickCheckAll}
                            />
                        </th>
                        <th>
                            <GSTrans t={"productList.tbheader.productNo"}/>
                        </th>
                        <th>
                            <GSTrans t={"productList.tbheader.productName"}/>
                        </th>
                        <th className="text-center">
                            <GSTrans t={"productList.tbheader.price"}/>
                        </th>
                        <th style={{width:"85px"}}>
                            <GSTrans t={"page.dashboard.table.quantity"}/>
                        </th>
                        <th className="text-center">
                            <GSTrans t={"page.order.create.cart.table.priceTotal"}/>
                        </th>
                        <th className="p-0">
                        </th>
                    </tr>
                    </thead>
                    <tbody>
                    {state.productList.map(product => {
                        return (
                            <ProductRow data={product}
                                        key={product.id}
                                        openRemoveConfirmModal={openRemoveConfirmModal}
                                        tabIndex={tabIndex}
                            />
                        )
                    })
                    }
                    {
                        state.productList.length == 0 &&
                        <div className="icon">
                            <img src="/assets/images/pos-empty.png"/>
                            <p>{i18next.t("page.gosocial.table.product.text")}</p>
                        </div>
                    }
                    </tbody>
                </GSTable>
            </div>
        </>
    );
};
OrderInFacebookProductList.propTypes = {};
const ProductRow = (props) => {
    const {state, dispatch} = useContext(FbMessengerContext.context);
    const refQuantity = useRef(null);
    const [stOutOfStockProductList, setStOutOfStockProductList] = useState([]);
    const [stIsShowModal, setStIsShowModal] = useState(false);
    const refSubmitBtn = useRef(null);
    const [stIsLoading, setStIsLoading] = useState(false);
    const storeBranch = useRecoilValue(OrderInFacebookRecoil.storeBranchState)
    const [stIsShowIMEIModal, setStIsShowIMEIModal] = useState(false);
    const [itemModelId, setItemModelId] = useState([])
    const [selectedBranchId, selectedBranchIds] = useState([])
    const [stStoreBranches, setStStoreBranches] = useState([])
    const [itemModelCodes, setItemModelCodes] = useState([])
    const [soldAndTransferingItemModelCodes, setSoldAndTransferingItemModelCodes] = useState([])
    const [stErrorToast, setStErrorToast] = useState({
        error: '',
        isToast: false
    })
    useEffect(() => {
        if (!stErrorToast.error) {
            return
        }
        $('.error-toast').show(300)
        setTimeout(() => {
            $('.error-toast').hide(300)
        }, 3000)
    }, [stErrorToast.isToast])
    useEffect(()=>{
        const request = [{
            itemId : props.data.itemId,
            itemModelIds : props.data.modelId ?`${props.data.itemId}_${props.data.modelId}` : props.data.itemId,
            quantity : props.data.quantity,
            userId: state.user.userId,
            storeId: storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_ID),
            saleChannel: Constants.SaleChannels.GOSELL,
            branchId: props.data.branchId
        }]
        if(state.user.userId && state.profileId){
            ItemService.listWholesalePrice(request)
                .then(result=>{
                    if (result.length > 0){
                        updateProductHasWholeSalePrice(result[0])
                    }else {
                        updateProductHasWholeSalePrice(props.data.id)
                    }
                })
        }else {
            updateProductHasWholeSalePrice(props.data.id)
        }
    },[props.data.quantity, state.profileId])
    const updateProductHasWholeSalePrice = (data) =>{
        return dispatch(FbMessengerContext.actions.updateProductHasWholeSalePrice(data));
    }
    const onClickCheck = () => {
        // dispatch(FbMessengerContext.actions.checkToggleProduct(props.data.id))
        onChangeProduct({
            checked: !props.data.checked
        })
    }
    const onClickRemove = () => {
        dispatch(FbMessengerContext.actions.removeProduct(props.data.id))
        const productListAfterRemove = [...state.productList].filter(p => p.id !== props.data.id)
        OrderInFacebookContextService.dispatchUpdateProductList(state, dispatch, productListAfterRemove, storeBranch)
        dispatch(FbMessengerContext.actions.clearInsufficientErrorGroup(props.data))
    }
    const onChangeProduct = (value) => {
        dispatch(FbMessengerContext.actions.modifyProduct({
            ...props.data,
            ...value
        }))
        dispatch(FbMessengerContext.actions.clearInsufficientErrorGroup(props.data))
    }
    const onBlurStock = (e) => {
        const value = e.currentTarget.value
        if (value < 1 || value > 100_000) {
            refQuantity.current.value = props.data.quantity
            return
        }
        if (value !== props.data.quantity) {
            // update temp list for response
            const productList = _.cloneDeep(state.productList)
            const currentProduct = productList.find((p) => p.id === props.data.id)
            currentProduct.quantity = value
            onChangeProduct({
                quantity: value
            })
            OrderInFacebookContextService.dispatchUpdateProductList(state, dispatch, productList, storeBranch)
        }
    }
    const renderDiscountPrice = () => {
        return (
            <>
                {CurrencyUtils.formatMoneyByCurrency((props.data.price * props.data.quantity), CurrencyUtils.getLocalStorageSymbol())}
            </>
        )
    }
    const handleUpdateOutOfStock = (data) => {
        const promises = []
        switch(data.inventoryManageType){
            case Constants.INVENTORY_MANAGE_TYPE.IMEI_SERIAL_NUMBER: {
                setStIsShowIMEIModal(true)
                selectedBranchIds(selectedBranchId.push(data.branchId))
                if (TokenUtils.isStaff()) {
                    promises.push(storeService.getActiveBranchByStaffId)
                } else {
                    promises.push(storeService.getStoreBranches())
                }
                Promise.all(promises).then(([branches]) => {
                    if (!branches.length) {
                        console.error('Store branch is empty')
                        return
                    }
                    setStStoreBranches(branches.filter(e => e.id === props.data.branchId))
                })
                if(props.data.modelId){
                    setItemModelId(itemModelId.push(props.data.itemId.concat('-',props.data.modelId)))
                } else {
                    setItemModelId(itemModelId.push(props.data.itemId))
                }
                Promise.all([ItemService.getCodeByItemModelIds(itemModelId)]).then(([listItemModelCodes]) => {
                    setItemModelCodes(listItemModelCodes.filter(e => e.status === Constants.ITEM_MODE_CODE_STATUS.AVAILABLE))
                    setSoldAndTransferingItemModelCodes(listItemModelCodes.filter(e => e.status !== Constants.ITEM_MODE_CODE_STATUS.AVAILABLE))
                })
                break
            }
            default:
                setStIsShowModal(true)
                break
        }
        setStOutOfStockProductList([data])
    }
    const onSubmitQuantityModal = (e, values) => {
        let listSerialNumber =[]
        let requestBody
        switch(props.data.inventoryManageType){
            case Constants.INVENTORY_MANAGE_TYPE.IMEI_SERIAL_NUMBER:{
                itemModelCodes.forEach(e => listSerialNumber.push(e.code))
                const buildRequest = () => {
                    let req = []
                    stOutOfStockProductList.forEach(product =>{
                        const currentStock = +(stOutOfStockProductList[0].itemStock)
                        req.push({
                            itemId: product.itemId,
                            modelId: product.modelId,
                            type: "SET",
                            stock: itemModelCodes.filter(code => code.branchId === product.branchId).length,
                            currentStock: currentStock || 0,
                            branchId : product.branchId ? product.branchId : null,
                            actionType: 'FROM_UPDATE_AT_INSTORE_PURCHASE',
                            listSerialNumber: listSerialNumber
                        })
                    })
                    return req
                }
                requestBody = buildRequest()
            }
                break
            default:{
                const buildRequest = (values) => {
                    let productList = []
                    for (const [productId, index] of Object.entries(values).filter(entry => !entry[0].includes('currentStock-'))) {
                        const currentStock = +(stOutOfStockProductList[0].itemStock)
                        const [itemId, modelId] = productId.split('-')
                        productList.push({
                            itemId,
                            modelId,
                            type: 'SET',
                            stock: values[productId],
                            currentStock: currentStock || 0,
                            branchId: storeBranch ? storeBranch.value : null,
                            actionType: 'FROM_UPDATE_AT_INSTORE_PURCHASE'
                        })
                    }
                    return productList
                }
                requestBody = buildRequest(values)
            }
                break
        }
        setStIsLoading(true)
        ItemService.updateInStoreProductQuantity(requestBody)
            .then(result => {
                GSToast.commonUpdate()
                const value = requestBody[0].stock
                if (value !== props.data.itemStock) {
                    // update temp list for response
                    const productList = _.cloneDeep(state.productList)
                    const currentProduct = productList.find((p) => p.id === props.data.id)
                    currentProduct.itemStock = value
                    onChangeProduct({
                        itemStock: value
                    })
                    OrderInFacebookContextService.dispatchUpdateProductList(state, dispatch, productList, storeBranch)
                }
                setStIsLoading(false)
                setStIsShowModal(false)
            })
            .catch(e => {
                setStIsLoading(false)
                GSToast.commonError()
            })
    }
    const onClickCloseChangeStockModal = (e) => {
        // setItemModelCodes(itemModelCodes.filter(e => e.id != ""))
        setStIsShowModal(false)
        setStIsShowIMEIModal(false)
    }
    const renderModalOutOfStock = () => {
        return (
            <Modal isOpen={stIsShowModal}
                   className="order-in-store-purchase-complete order-in-store-purchase-complete__quantity-modal">
                {stIsLoading &&
                <LoadingScreen/>
                }
                <ModalHeader>
                    <h6 className="mb-1">
                        <GSTrans t="page.order.create.complete.quantityModal.title"/>
                    </h6>
                    <p className="font-size-14px color-gray">
                        <GSTrans t="page.order.create.complete.quantityModal.subTitle"/>
                    </p>
                </ModalHeader>
                <ModalBody className="mt-0 pt-0">
                    <AvForm onValidSubmit={onSubmitQuantityModal}
                            className="order-in-store-purchase-complete__product-form gs-atm__scrollbar-1">
                        <button ref={refSubmitBtn} hidden/>
                        <UikWidgetTable className="order-in-store-purchase-complete__product-table">
                            <thead>
                            <tr>
                                <th>
                                    <GSTrans t="page.order.create.complete.quantityModal.table.productName"/>
                                </th>
                                <th>
                                    <GSTrans t="page.order.create.complete.quantityModal.table.pricePerProduct"/>
                                </th>
                                <th>
                                    <GSTrans t="page.order.create.complete.quantityModal.table.stock"/>
                                </th>
                            </tr>
                            </thead>
                            <tbody>
                            {stOutOfStockProductList.map(product => {
                                return (
                                    <tr key={product.id}>
                                        <td>
                                            <div>
                                                <h6 className="mb-0 order-in-store-purchase-complete__table-product-name">
                                                    {product.name}
                                                </h6>
                                                {product.modelName &&
                                                <p className="color-gray font-size-14px mb-0">
                                                    {ItemUtils.escape100Percent(product.modelName)}
                                                </p>
                                                }
                                            </div>
                                        </td>
                                        <td className="text-center">
                                                <span className="color-gray">
                                                    {CurrencyUtils.formatMoneyByCurrency(product.price, CurrencyUtils.getLocalStorageSymbol())}
                                                </span>
                                        </td>
                                        <td>
                                            <AvFieldCurrency name={product.id + ''}
                                                             unit={CurrencySymbol.NONE}
                                                             validate={{
                                                                 ...FormValidate.required(),
                                                                 ...FormValidate.minValue(1),
                                                                 ...FormValidate.maxValue(1_000_000, true)
                                                             }}
                                                             value={product.itemStock}
                                                             parentClassName="order-in-store-purchase-complete__input-stock"
                                            />
                                            <AvField name={'currentStock-' + product.id + ''}
                                                     defaultValue={product.quantity}
                                                     hidden
                                            />
                                        </td>
                                    </tr>
                                )
                            })
                            }
                            </tbody>
                        </UikWidgetTable>
                    </AvForm>
                </ModalBody>
                <ModalFooter>
                    <GSButton secondary outline marginRight onClick={onClickCloseChangeStockModal}>
                        <GSTrans t="common.btn.cancel"/>
                    </GSButton>
                    <GSButton success onClick={() => refSubmitBtn.current.click()}>
                        <GSTrans t="component.order.date.range.apply"/>
                    </GSButton>
                </ModalFooter>
            </Modal>
        )
    }
    const renderModalIMEIOutOfStock = () => {
        return (
            <Modal isOpen={stIsShowIMEIModal}
                   className="managed-inventory-modal">
                {stIsLoading &&
                <LoadingScreen/>
                }
                <div className="error-toast">
                    { stErrorToast.error }
                </div>
                <ModalHeader >
                    <div className="product-translate__titleHeader text-left text-black-100">
                        <p>{i18next.t("page.product.allProduct.productDetail.add.IMEISerial")}</p>
                    </div>
                </ModalHeader>
                <ModalBody>
                    <div className="d-flex">
                        <div className="table left">
                            <table>
                                <thead>
                                <tr>
                                    <th>{i18next.t('productList.tbheader.productName')}</th>
                                </tr>
                                </thead>
                                <tbody>
                                {stOutOfStockProductList.map(product => {
                                    return (
                                        <tr key={product.id}>
                                            <td className="text-left">
                                                {product.name}
                                            </td>
                                        </tr>
                                    )
                                })}
                                </tbody>
                            </table>
                        </div>
                        <div className="table right">
                            <table>
                                <thead>
                                <tr>
                                    {stStoreBranches.map(branch => {
                                        return (
                                            <th>{branch.name}</th>
                                        )
                                    })}
                                </tr>
                                </thead>
                                <tbody>
                                {stOutOfStockProductList.map(product => {
                                    return (
                                        <th key={product.id}>
                                            <AvForm onValidSubmit={onSubmitQuantityModal}
                                                    className="in-purchase" autoComplete="off">
                                                <button ref={refSubmitBtn} hidden/>
                                                <div className="input-code">
                                                    <AvField
                                                        id={`input-serial-${product.id}`}
                                                        className={`input-serial-${product.id}`}
                                                        name="serial"
                                                        placeholder={i18next.t('component.managedInventoryModal.hint')}
                                                        validate={{
                                                            ...FormValidate.maxLength(65)
                                                        }}
                                                        onKeyPress={e => handleInputCode(e, product)}
                                                    />
                                                </div>
                                                <div className="code in-purchase d-flex flex-wrap mt-2">
                                                    {itemModelCodes.filter(item => item.branchId === product.branchId).map((e, index) => {
                                                        return (
                                                            <div key={index} className="content mt-2">
                                                                <p className="mb-0">{e.code}</p>
                                                                <i onClick={() => handleDeleteSerial(product, e.code)}
                                                                   className="fa fa-times"></i>
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            </AvForm>
                                        </th>
                                    )
                                })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </ModalBody>
                <ModalFooter>
                    <GSButton secondary outline marginRight onClick={onClickCloseChangeStockModal}>
                        <GSTrans t="common.btn.cancel"/>
                    </GSButton>
                    <GSButton success onClick={() => {
                        refSubmitBtn.current.click()
                        setStIsShowIMEIModal(false)
                    }}>
                        <GSTrans t="component.order.date.range.apply"/>
                    </GSButton>
                </ModalFooter>
            </Modal>
        )
    }
    const clearInputValue = (productId) => {
        setTimeout(() => {
            Array.from(document.getElementsByClassName(`input-serial-${ productId }`)).forEach(el => el.value = '')
        }, 10)
    }
    const handleInputCode = async (e, product) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            const value = e.currentTarget.value.trim()
            if (value === '' || itemModelCodes.length > 1000000) {
                return
            }
            const duplicateIndexSerialCode = itemModelCodes.findIndex(element => element.code.toLowerCase() === value.toLowerCase())
            const duplicateNotAvailableSerialCode = soldAndTransferingItemModelCodes.findIndex(element => element.code.toLowerCase() === value.toLowerCase())
            if(duplicateNotAvailableSerialCode !== -1){
                showToast('component.managedInventoryModal.error.soldTransferImei', { value: `{${ value }}` })
                return
            }
            if(duplicateIndexSerialCode !== -1){
                showToast('component.managedInventoryModal.error.exist', { value: `{${ value }}` })
                return
            }
            setItemModelCodes(list => [...list, {
                id: "",
                itemId: product.itemId,
                modelId: product.modelId,
                branchId: product.branchId,
                code: value,
                status: Constants.ITEM_MODE_CODE_STATUS.AVAILABLE
            }])
            clearInputValue(product.id)
        }
    }
    const handleDeleteSerial = (product, code) =>{
        let lstSerial = [];
        lstSerial = itemModelCodes.filter(e => e.branchId === product.branchId && e.code !== code)
        setItemModelCodes(_.cloneDeep(lstSerial))
    }
    const showToast = (error, options = {}) => {
        setStErrorToast(toast => ({
            isToast: !toast.isToast,
            error: <GSTrans t={ error } values={ { value: options.value } }/>
        }))
    }
    const renderDiscountLabel = () => {
        // if (props.data.wholeSale) {
        //     return (
        //         <div>
        //             <img src="/assets/images/icon-sf-shoppingcart.svg" alt="discount" className="mr-1" width="12"
        //                  height="12"/>
        //             <span className="gs-frm-input__label font-size-12px">
        //             <GSTrans t="page.order.instorePurchase.wholeSaleDiscount" values={{
        //                 discount: props.data.wholeSale.type === 'FIXED_AMOUNT' ? CurrencyUtils.formatMoneyByCurrency(props.data.wholeSale.wholesaleValue, props.data.currency) : props.data.wholeSale.wholesaleValue + '%'
        //             }}/>
        //         </span>
        //         </div>
        //     )
        // }
        // else {
        //     if (props.data.promotion && props.data.promotion.couponType != CouponTypeEnum.FREE_SHIPPING) {
        //         return (
        //             <div>
        //                 <img src="/assets/images/icon-discount.png" alt="discount" className="mr-1" width="12"
        //                      height="12"/>
        //                 <span
        //                     className="gs-frm-input__label font-size-12px text-uppercase">{props.data.promotion.couponCode}</span>
        //             </div>
        //         )
        //     }
        //
        //     // have membership
        //     if (state.membership && state.membership.enabledBenefit && (!props.data.promotion || (props.data.promotion && props.data.promotion.couponType && CouponTypeEnum.FREE_SHIPPING))) {
        //         return (
        //             <div>
        //                 <img src="/assets/images/icon-discount.png" alt="discount" className="mr-1" width="12"
        //                      height="12"/>
        //                 <span className="gs-frm-input__label font-size-12px text-uppercase">
        //                     <GSTrans t={'page.order.instorePurchase.membershipLabel'}/>
        //                 </span>
        //             </div>
        //         )
        //     }
        // }
        return null
    }

    const renderUpdateStock = () => {
        const quantity = parseInt(props.data.quantity)
        const itemStock = parseInt(props.data.itemStock)

        if (quantity > itemStock) {
            return (
                <span style={ { width: '65px', height: '30px' } } className="err-out-of-stock">
                    <GSTrans t="page.orders.POS.InstorePurchase.availableStock"/>: { props.data.itemStock }
                    {
                        !props.data.parentId && <GSComponentTooltip
                            message={ i18next.t(`page.orders.POS.InstorePurchase.updateStock`) }
                            placement={ GSComponentTooltipPlacement.BOTTOM }>
                            <i onClick={ () => handleUpdateOutOfStock(props.data) }
                               className="action-button first-button"></i>
                        </GSComponentTooltip>
                    }
                </span>
            )
        }
    }

    const renderInsufficientStockError = () => {
        if (state.insufficientErrorGroup.some(i => i.includes(ItemUtils.computeItemModelIdV2(props.data.itemId, props.data.modelId)))) {
            return <span className='error'><GSTrans t='page.orders.POS.InstorePurchase.error.insufficientStock'/></span>
        }
    }

    return (
        <tr className={["order-in-store-purchase-cart-product-list__product-row",
            "order-in-store-purchase-cart-product-list__product-row--" + (props.data.checked ? 'checked' : 'unchecked')
        ].join(' ')}
            style={{
                backgroundColor: props.data.deleted ? '#fff5f5' : 'unset'
            }}
        >
            {renderModalOutOfStock()}
            {renderModalIMEIOutOfStock()}
            <td className="p-2" hidden>
                <UikCheckbox className="mb-0"
                             defaultChecked={props.data.checked}
                             onClick={onClickCheck}
                             key={props.data.checked}
                />
            </td>
            <td className="text-left">
                {state.productList.indexOf(props.data) + 1}
            </td>
            <td style={{width:"200px"}}>
                <div className="d-flex justify-content-start align-items-start">
                    {props.data.deleted &&
                    <GSComponentTooltip message={i18next.t('page.order.instorePurchase.productHasBeenDeleted')}>
                        <img src={'/assets/images/icon-error.svg'} className="mr-3"/>
                    </GSComponentTooltip>
                    }
                    <img src={props.data.image}
                         alt="product-thumbnail"
                         className="order-in-store-purchase-cart-product-list__product-thumbnail"
                    />
                    <div className="ml-2 order-in-store-purchase-cart-product-list__product-name">
                        <h6 >
                            {props.data.name}
                        </h6>
                        {props.data.modelName &&
                        <span>{ItemUtils.escape100Percent(props.data.modelName).replace(/\|/gm, ' | ')}</span>
                        }
                    </div>
                </div>
            </td>
            <td style={{width:"110px"}} className="text-center order-in-store-purchase-cart-product-list__product-name">
                {CurrencyUtils.formatMoneyByCurrency(props.data.price, CurrencyUtils.getLocalStorageSymbol())}
                <br/>
                <div className="d-flex flex-column">
                    {renderDiscountLabel()}
                    {props.data.isWhosalePrice &&
                    <div>
                        <img src="/assets/images/icon-wholesale-price.png" alt="discount" className="mr-1" width="12"
                             height="12"/>
                        <span style={{fontSize: '10px'}} className="gs-frm-input__label text-uppercase">
                        {i18next.t('page.gosocial.wholesalePrice.percent',{x:props.data.salePercent})}
                    </span>
                    </div>
                    }
                </div>
            </td>
            <td style={{width:"85px"}} className='pt-3 order-in-store-purchase-cart-product-list__product-name'>
                <input type="number"
                       className="form-control order-in-store-purchase-cart-product-list__stock-input"
                       defaultValue={props.data.quantity}
                       onBlur={onBlurStock}
                       min={1}
                       key={'quantity_' + props.data.quantity + '_tabIndex' + props.tabIndex}
                       ref={refQuantity}
                />
                { renderUpdateStock() }
                { renderInsufficientStockError() }
                <span className='mt-1 font-style-italic'>
                    { props.data.conversionUnitName }
                </span>
            </td>
            <td key={'discount-price ' + props.data.quantity} className="text-center order-in-store-purchase-cart-product-list__product-name">
                {renderDiscountPrice()}
            </td>
            <td className="order-in-store-purchase-cart-product-list__td-action pr-3">
                <GSActionButton icon={GSActionButtonIcons.DELETE} onClick={onClickRemove}/>
            </td>
        </tr>
    )
}
const ImageShape = PropTypes.shape({
    imageId: PropTypes.number,
    imageUUID: PropTypes.string,
    urlPrefix: PropTypes.string,
})
ProductRow.propTypes = {
    openRemoveConfirmModal: PropTypes.func,
    data: PropTypes.shape({
        deleted: PropTypes.bool,
        wholeSale: PropTypes.shape({
            discountAmount: PropTypes.number,
            itemId: PropTypes.number,
            minQuantity: PropTypes.number,
            modelId: PropTypes.number,
            type: PropTypes.string,
            wholesaleId: PropTypes.number,
            wholesaleValue: PropTypes.number
        }),
        checked: PropTypes.bool,
        currency: PropTypes.string,
        deposit: PropTypes.bool,
        id: PropTypes.any,
        image: PropTypes.any,
        itemId: PropTypes.any,
        itemType: PropTypes.string,
        modelId: PropTypes.any,
        modelName: PropTypes.string,
        name: PropTypes.string,
        price: PropTypes.number,
        quantity: PropTypes.any,
        weight: PropTypes.number,
        promotion: PropTypes.shape({
            couponCode: PropTypes.string,
            couponId: PropTypes.number,
            couponItem: PropTypes.shape({
                itemId: PropTypes.number,
                modelId: PropTypes.number,
                promoAmount: PropTypes.number
            }),
            couponType: PropTypes.string,
            freeShipping: PropTypes.bool
        }),
    }),
}
export default OrderInFacebookProductList;
