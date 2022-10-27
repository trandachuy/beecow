/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 15/01/2020
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React, {useContext, useEffect, useRef, useState} from 'react';
import './OrderInStorePurchaseCartProductList.sass';
import PropTypes from 'prop-types';
import {OrderInStorePurchaseContext} from "../../context/OrderInStorePurchaseContext";
import GSTrans from "../../../../../components/shared/GSTrans/GSTrans";
import {UikCheckbox, UikWidgetTable} from '../../../../../@uik';
import {CurrencyUtils} from "../../../../../utils/number-format";
import GSActionButton, {GSActionButtonIcons} from "../../../../../components/shared/GSActionButton/GSActionButton";
import ConfirmModal from "../../../../../components/shared/ConfirmModal/ConfirmModal";
import {Trans} from "react-i18next";
import _ from 'lodash';
import {OrderInStorePurchaseContextService} from "../../context/OrderInStorePurchaseContextService";
import GSComponentTooltip, {GSComponentTooltipPlacement} from "../../../../../components/shared/GSComponentTooltip/GSComponentTooltip";
import i18next from "i18next";
import {CouponTypeEnum} from "../../../../../models/CouponTypeEnum";
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
import {OrderInStorePurchaseRecoil} from "../../recoil/OrderInStorePurchaseRecoil";
import LoadingScreen from "../../../../../components/shared/LoadingScreen/LoadingScreen";
import ManageInventoryOrderModal from "../../ManageInventoryOrderModal/ManageInventoryOrderModal";
import UpdateStockIMEIModal from "../../updateStockIMEIModal/UpdateStockIMEIModal";
import storageService from "../../../../../services/storage";
import Constants from "../../../../../config/Constant";
import {BCOrderService} from "../../../../../services/BCOrderService";
import {OrderInStorePurchaseRequestBuilder} from "../../OrderInStorePurchaseRequestBuilder";


const OrderInStorePurchaseCartProductList = props => {
    const {state, dispatch} = useContext(OrderInStorePurchaseContext.context);
    const refConfirmRemove = useRef(null);
    const refAlertModal = useRef();

    const storeBranch = useRecoilValue(OrderInStorePurchaseRecoil.storeBranchState)
    const tabIndex = useRecoilValue(OrderInStorePurchaseRecoil.currentOrderIndexState)

    useEffect(() => {

        const request = state.productList.map(item=>(
            {
                itemId: item.itemId,
                itemModelIds: item.modelId ? `${item.itemId}_${item.modelId}` : item.itemId,
                quantity: item.quantity,
                userId: state.buyerId,
                storeId: storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_ID),
                saleChannel: Constants.SaleChannels.GOSELL,
                branchId: item.branchId
            }
        ))

        if (state.buyerId || state.profileId) {
            BCOrderService.checkWholesaleOnProduct(state.buyerId, state.productList.map(i=>i.itemId).join(','))
                .then(checkWholesaleOnProduct => {
                    const removeObj = checkWholesaleOnProduct.map(r=> r.productId);
                    const productList = request.filter(p=>{
                        return removeObj.indexOf(+(p.itemId)) === -1;
                    });
                    if(!state.buyerId){
                        for (let productListElement of productList) {
                            productListElement.customerId = state.profileId;
                        }}
                    ItemService.listWholesalePrice(productList)
                        .then(result => {
                            updateProductHasWholeSalePriceChangeBuyerId({
                                productList,
                                wholeSalePrice:result
                            })
                        })
                })
        } else {
            updateProductHasWholeSalePriceChangeBuyerId({
                productList:request,
                wholeSalePrice:[]
            })
        }


    }, [state.buyerId, state.profileId])

    useEffect(() => {
        OrderInStorePurchaseContextService.dispatchUpdateProductList(state, dispatch, state.productList, storeBranch)
    }, [state.checkWholeSalePrice])


    const isCheckedAll = state.productList.filter(p => p.checked).length === state.productList.length && state.productList.length > 0

    const updateProductHasWholeSalePriceChangeBuyerId = (data) => {
        return dispatch(OrderInStorePurchaseContext.actions.updateProductHasWholeSalePriceChangeBuyerId(data));
    }
    
    const onClickCheckAll = () => {
        if (isCheckedAll) {
            dispatch(OrderInStorePurchaseContext.actions.uncheckAllProduct())
        } else {
            dispatch(OrderInStorePurchaseContext.actions.checkAllProduct())
        }
    }

    const openRemoveConfirmModal = (productId) => {

        const handleOkCallback = () => {
            dispatch(OrderInStorePurchaseContext.actions.removeProduct(productId))
            const productListAfterRemove = [...state.productList].filter(p => p.id !== productId)
            OrderInStorePurchaseContextService.dispatchUpdateProductList(state, dispatch, productListAfterRemove, storeBranch)
            dispatch(OrderInStorePurchaseContext.actions.clearInsufficientErrorGroup(productListAfterRemove))
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
            <div className="order-in-store-purchase-cart-product-list gs-atm__scrollbar-1 h-100"
                 style={{backgroundImage: state.productList.length == 0 ? "url('/assets/images/pos-empty.png')" : ""}}>
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
                            <GSTrans t={"productList.tbheader.productSKU"}/>
                        </th>
                        <th>
                            <GSTrans t={"productList.tbheader.productName"}/>
                        </th>
                        <th className="text-center">
                            <GSTrans t={"productList.tbheader.price"}/>
                        </th>
                        <th>
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
                    </tbody>
                </GSTable>
            </div>
        </>
    );
};

OrderInStorePurchaseCartProductList.propTypes = {};

const ProductRow = (props) => {
    const {state, dispatch} = useContext(OrderInStorePurchaseContext.context);
    const refQuantity = useRef(null);
    const [stOutOfStockProductList, setStOutOfStockProductList] = useState([]);
    const [stIsShowModal, setStIsShowModal] = useState(false);
    const refSubmitBtn = useRef(null);
    const [stIsLoading, setStIsLoading] = useState(false);
    const [stIsOpenManagedInventoryModal, setStIsOpenManagedInventoryModal] = useState(false);
    const [stIsOpenUpdateOutOfStockImeiModal, setStIsOpenUpdateOutOfStockImeiModal] = useState(false);


    const storeBranch = useRecoilValue(OrderInStorePurchaseRecoil.storeBranchState)


    useEffect(() => {

        const request = [{
            itemId: props.data.itemId,
            itemModelIds: props.data.modelId ? `${props.data.itemId}_${props.data.modelId}` : props.data.itemId,
            quantity: props.data.quantity,
            userId: state.buyerId,
            storeId: storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_ID),
            saleChannel: Constants.SaleChannels.GOSELL,
            branchId: props.data.branchId,
            customerId: state.profileId,
        }]

        if (state.buyerId || state.profileId) {
            BCOrderService.checkWholesaleOnProduct(state.buyerId, props.data.itemId, state.profileId)
                .then(checkWholesaleOnProduct => {
                    if (checkWholesaleOnProduct.length === 0) {
                        ItemService.listWholesalePrice(request)
                            .then(result => {
                                if (result.length > 0) {
                                    updateProductHasWholeSalePrice(result[0])
                                } else {
                                    updateProductHasWholeSalePrice(props.data.id)

                                }
                            })
                    } else {
                        updateProductHasWholeSalePrice(props.data.id)
                    }
                })
        } else {
            updateProductHasWholeSalePrice(props.data.id)
        }


    }, [props.data.quantity])

    useEffect(() => {
        if (state.discountOption.type === Constants.DISCOUNT_OPTION.DISCOUNT_AMOUNT && !(_.isNull(state.discountOption.discount)) && !(_.isNull(state.discountOption.percent))) {
            if (parseFloat(state.discountOption.discount) > OrderInStorePurchaseContextService.calculateSubTotalPrice(state.productList)) {
                dispatch(
                    OrderInStorePurchaseContext.actions.applyDiscountCode({
                        discount: OrderInStorePurchaseContextService.calculateSubTotalPrice(state.productList),
                        type: state.discountOption.type,
                        percent: state.discountOption.percent
                    })
                )
            }
        }

        if (state.discountOption.type === Constants.DISCOUNT_OPTION.DISCOUNT_PERCENT && !(_.isNull(state.discountOption.discount)) && !(_.isNull(state.discountOption.percent))) {
            const subTotalPrice = OrderInStorePurchaseContextService.calculateSubTotalPrice(state.productList)
            dispatch(
                OrderInStorePurchaseContext.actions.applyDiscountCode({
                    discount: (subTotalPrice * state.discountOption.percent) / 100,
                    type: state.discountOption.type,
                    percent: state.discountOption.percent
                })
            )
        }
    }, [props.data.quantity])


    const updateProductHasWholeSalePrice = (data) => {
        return dispatch(OrderInStorePurchaseContext.actions.updateProductHasWholeSalePrice(data));
    }

    const onClickCheck = () => {
        // dispatch(OrderInStorePurchaseContext.actions.checkToggleProduct(props.data.id))
        onChangeProduct({
            checked: !props.data.checked
        })
    }

    const onClickRemove = () => {
        dispatch(OrderInStorePurchaseContext.actions.removeProduct(props.data.id))
        const productListAfterRemove = [...state.productList].filter(p => p.id !== props.data.id)
        OrderInStorePurchaseContextService.dispatchUpdateProductList(state, dispatch, productListAfterRemove, storeBranch)
        dispatch(OrderInStorePurchaseContext.actions.clearInsufficientErrorGroup(props.data))
    }

    const onChangeProduct = (value) => {
        dispatch(OrderInStorePurchaseContext.actions.modifyProduct({
            ...props.data,
            ...value
        }))
        dispatch(OrderInStorePurchaseContext.actions.clearInsufficientErrorGroup(props.data))
    }

    const onClickStock = e => e.currentTarget.focus();

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
            OrderInStorePurchaseContextService.dispatchUpdateProductList(state, dispatch, productList, storeBranch)
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
        setStIsShowModal(true)
        setStOutOfStockProductList([data])
    }

    const onSubmitQuantityModal = (e, values) => {
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
        const requestBody = buildRequest(values)

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

                    OrderInStorePurchaseContextService.dispatchUpdateProductList(state, dispatch, productList, storeBranch)
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
        setStIsShowModal(false)
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


    const renderDiscountLabel = () => {

        if (props.data.wholeSale) {
            return (
                <div>
                    <img src="/assets/images/icon-sf-shoppingcart.svg" alt="discount" className="mr-1" width="12"
                         height="12"/>
                    <span className="gs-frm-input__label font-size-12px">
                    <GSTrans t="page.order.instorePurchase.wholeSaleDiscount" values={{
                        discount: props.data.wholeSale.type === 'FIXED_AMOUNT' ? CurrencyUtils.formatMoneyByCurrency(props.data.wholeSale.wholesaleValue, CurrencyUtils.getLocalStorageSymbol()) : props.data.wholeSale.wholesaleValue + '%'
                    }}/>
                </span>
                </div>
            )
        } else {
            if (props.data.promotion && props.data.promotion.couponType != CouponTypeEnum.FREE_SHIPPING) {
                return (
                    <div>
                        <img src="/assets/images/icon-discount.png" alt="discount" className="mr-1" width="12"
                             height="12"/>
                        <span
                            className="gs-frm-input__label font-size-12px text-uppercase">{props.data.promotion.couponCode}</span>
                    </div>
                )
            }

            if (props.data.discountCode) {
                return
            }

            // have membership
            if (state.membership && state.membership.enabledBenefit && (!props.data.promotion || (props.data.promotion && props.data.promotion.couponType && CouponTypeEnum.FREE_SHIPPING))) {
                return (
                    <div>
                        <img src="/assets/images/icon-discount.png" alt="discount" className="mr-1" width="12"
                             height="12"/>
                        <span className="gs-frm-input__label font-size-12px text-uppercase">
                            <GSTrans t={'page.order.instorePurchase.membershipLabel'}/>
                        </span>
                    </div>
                )
            }
        }

        return null
    }

    const handleUpdateStockIMEI = (data) => {
        setStIsOpenUpdateOutOfStockImeiModal(true)
    }

    const handleCloseUpdateOutOfStockImeiModal = () => {
        setStIsOpenUpdateOutOfStockImeiModal(false)
    }

    const onSubmitUpdateStockImei = (managedInventoryList, currentStock) => {
        const requestBody = {
            itemId: props.data.itemId,
            modelId: props.data.modelId,
            type: 'SET',
            stock: managedInventoryList[0].serial.length,
            currentStock: currentStock || 0,
            branchId: storeBranch ? storeBranch.value : null,
            actionType: 'FROM_UPDATE_AT_INSTORE_PURCHASE',
            listSerialNumber: managedInventoryList[0].serial
        }

        setStIsLoading(true)
        ItemService.updateInStoreProductQuantity(requestBody)
            .then(result => {
                GSToast.commonUpdate()

                const value = requestBody.stock

                if (value !== props.data.itemStock) {
                    // update temp list for response
                    const productList = _.cloneDeep(state.productList)
                    const currentProduct = productList.find((p) => p.id === props.data.id)
                    currentProduct.itemStock = value
                    onChangeProduct({
                        itemStock: value
                    })

                    OrderInStorePurchaseContextService.dispatchUpdateProductList(state, dispatch, productList, storeBranch)
                }
                setStIsLoading(false)
                setStIsShowModal(false)
            })
            .catch(e => {
                setStIsLoading(false)
            })
    }

    const handleStockImeiPOS = () => {
        setStIsOpenManagedInventoryModal(true)
    }

    const handleManagedInventoryCallback = () => {
        setStIsOpenManagedInventoryModal(false)
    }

    const selectImeiModalSave = (imeiSerial) => {
        dispatch(OrderInStorePurchaseContext.actions.setProductIMEI({
            id: props.data.id,
            imeiSerial
        }))
        setStIsOpenManagedInventoryModal(false)
    }

    const renderSelectIMEI = () => {
        if (props.data.inventoryManageType !== Constants.INVENTORY_MANAGE_TYPE.IMEI_SERIAL_NUMBER) {
            return
        }

        const quantity = parseInt(props.data.quantity)
        const itemStock = parseInt(props.data.itemStock)

        if (quantity > itemStock) {
            return (
                <p className='m-0' style={{width: '150px', height: '0px'}}></p>
            )
        }

        return (
            <p style={{width: '175px', height: '20px'}} onClick={handleStockImeiPOS}
               className={state.errorIMEI ? 'select-IMEI errorIMEI' : 'select-IMEI'}>
                <i className="action-select-IMEI"></i>
                {
                    props.data.imeiSerial == null || props.data.imeiSerial?.length === 0 ?
                        <GSTrans t="component.managedInventoryPOSModal.updateStock.title"/> :
                        <GSTrans t="component.managedInventoryPOSModal.updateStock.titleSelected" values={{
                            x: props.data.imeiSerial?.length,
                            max: props.data.quantity
                        }}/>
                }
            </p>
        )
    }

    const renderUpdateStock = () => {
        const quantity = parseInt(props.data.quantity)
        const itemStock = parseInt(props.data.itemStock)

        if (quantity > itemStock) {
            return (
                <p style={{width: '160px', height: '20px'}} className="err-out-of-stock">
                    <GSTrans t="page.orders.POS.InstorePurchase.availableStock"/>: {props.data.itemStock}
                    {
                        !props.data.parentId && <GSComponentTooltip
                            message={i18next.t(`page.orders.POS.InstorePurchase.updateStock`)}
                            placement={GSComponentTooltipPlacement.BOTTOM}>
                            {
                                props.data.inventoryManageType == 'PRODUCT' ?
                                    <i onClick={() => handleUpdateOutOfStock(props.data)}
                                       className="action-button first-button"></i> :
                                    <i onClick={() => handleUpdateStockIMEI(props.data)}
                                       className="action-button first-button"></i>
                            }
                        </GSComponentTooltip>
                    }
                </p>
            )
        }

        return (
            <p className="m-0" style={{width: '150px', height: '0px'}}></p>
        )
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
            <UpdateStockIMEIModal
                isOpenModal={stIsOpenUpdateOutOfStockImeiModal}
                branchId={+(props.data.branchId)}
                prodName={props.data.name}
                modelName={props.data.modelName}
                callback={handleCloseUpdateOutOfStockImeiModal}
                onSubmit={onSubmitUpdateStockImei}
                itemId={props.data.itemId}
                modelId={props.data.modelId}
            />
            {renderModalOutOfStock()}
            <ManageInventoryOrderModal
                isOpenModal={stIsOpenManagedInventoryModal}
                name={props.data.name}
                modelName={props.data.modelName}
                itemId={props.data.itemId}
                modelId={props.data.modelId}
                branchId={props.data.branchId}
                quantity={props.data.quantity}
                defaultCodes={props.data.imeiSerial || []}
                cancelCallback={handleManagedInventoryCallback}
                saveCallback={selectImeiModalSave}>
            </ManageInventoryOrderModal>
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
            <td className="text-left">
                {props.data.sku ? props.data.sku : '-'}
            </td>
            <td style={{maxWidth: '450px'}}>
                <div className="d-flex justify-content-start align-items-center">
                    {props.data.deleted &&
                    <GSComponentTooltip message={i18next.t('page.order.instorePurchase.productHasBeenDeleted')}>
                        <img src={'/assets/images/icon-error.svg'} className="mr-3"/>
                    </GSComponentTooltip>
                    }
                    <img src={props.data.image}
                         alt="product-thumbnail"
                         className="order-in-store-purchase-cart-product-list__product-thumbnail"
                    />
                    <div className="ml-3" style={{width: '80%'}}>
                        <h6 className="order-in-store-purchase-cart-product-list__product-name">
                            {props.data.name}

                        </h6>
                        {props.data.modelName &&
                        <span>{ItemUtils.escape100Percent(props.data.modelName).replace(/\|/gm, ' | ')}</span>
                        }
                    </div>
                </div>
            </td>
            <td className="text-center">
                {CurrencyUtils.formatMoneyByCurrency(props.data.price, CurrencyUtils.getLocalStorageSymbol())}
                <br/>
                <div className="d-flex flex-column">
                    {renderDiscountLabel()}
                    {props.data.isWhosalePrice &&
                    <div>
                        <img src="/assets/images/icon-wholesale-price.png" alt="discount" className="mr-1" width="12"
                             height="12"/>
                        <span style={{fontSize: '10px'}} className="gs-frm-input__label text-uppercase">
                        {i18next.t('page.gosocial.wholesalePrice.percent', {x: props.data.salePercent})}
                    </span>
                    </div>
                    }
                </div>

            </td>
            <td className='pt-4'>
                <input type="number"
                       className="form-control order-in-store-purchase-cart-product-list__stock-input"
                       defaultValue={props.data.quantity}
                       onBlur={onBlurStock}
                       onClick={onClickStock}
                       min={1}
                       key={'quantity_' + props.data.quantity + '_tabIndex' + props.tabIndex}
                       ref={refQuantity}
                />
                {renderSelectIMEI()}
                {renderUpdateStock()}
                {renderInsufficientStockError()}
                {
                    props.data.conversionUnitName &&
                    <span className="unit">
                        <span>{i18next.t('page.transfer.stock.table.column.unit')}: </span> {props.data.conversionUnitName}
                    </span>
                }
            </td>

            <td key={'discount-price ' + props.data.quantity} className="text-center">
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
        itemId: PropTypes.number,
        imeiSerial: PropTypes.array,
        itemType: PropTypes.string,
        modelId: PropTypes.number,
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

export default OrderInStorePurchaseCartProductList;
