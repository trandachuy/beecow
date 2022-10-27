/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 17/12/2020
 * Author: Dinh Vo <dinh.vo@mediastep.com>
 *******************************************************************************/
import React, {useContext, useEffect, useRef, useState} from 'react';
import './QuotationComplete.sass';
import GSWidget from "../../../../components/shared/form/GSWidget/GSWidget";
import GSWidgetContent from "../../../../components/shared/form/GSWidget/GSWidgetContent";
import GSButton from "../../../../components/shared/GSButton/GSButton";
import {Modal} from "reactstrap";
import ModalHeader from "reactstrap/es/ModalHeader";
import ModalBody from "reactstrap/es/ModalBody";
import ModalFooter from "reactstrap/es/ModalFooter";
import GSTrans from "../../../../components/shared/GSTrans/GSTrans";
import {UikWidgetTable} from '../../../../@uik';
import {ContextQuotation} from "../context/ContextQuotation";
import {CurrencyUtils, NumberUtils} from "../../../../utils/number-format";
import AvFieldCurrency from "../../../../components/shared/AvFieldCurrency/AvFieldCurrency";
import {CurrencySymbol} from "../../../../components/shared/form/CryStrapInput/CryStrapInput";
import {AvField, AvForm} from 'availity-reactstrap-validation';
import {FormValidate} from "../../../../config/form-validate";
import {ItemService} from "../../../../services/ItemService";
import {GSToast} from "../../../../utils/gs-toast";
import LoadingScreen from "../../../../components/shared/LoadingScreen/LoadingScreen";
import {ContextQuotationService} from "../context/ContextQuotationService";
import storageService from "../../../../services/storage";
import Constants from "../../../../config/Constant";
import {RouteUtils} from "../../../../utils/route";
import {NAV_PATH} from "../../../../components/layout/navigation/Navigation";
import AlertModal, {AlertModalType} from "../../../../components/shared/AlertModal/AlertModal";
import i18next from "../../../../config/i18n";
import storeService from '../../../../services/StoreService';
import catalogService from '../../../../services/CatalogService';
import {cancelablePromise} from '../../../../utils/promise';
import * as _ from 'lodash';
import beehiveService from '../../../../services/BeehiveService';
import * as FileSaver from 'file-saver'
import * as XLSX from 'xlsx'
import {CredentialUtils} from '../../../../utils/credential'

export const KEY_PRINT_A4 = "A4";
export const KEY_PRINT_K57 = "K57";
export const KEY_PRINT_K80 = "K80";
export const LIST_PAGE_SIZE = [{
    value: KEY_PRINT_A4,
    label: "page.order.create.complete.print.size.A4"
},
{
    value: KEY_PRINT_K57,
    label: "page.order.create.complete.print.size.K57"
},
{
    value: KEY_PRINT_K80,
    label: "page.order.create.complete.print.size.K80"
}];
const STORE_CURRENCY_SYMBOL = CurrencyUtils.getLocalStorageSymbol()

const QuotationComplete = (props) => {
    const {state, dispatch} = useContext(ContextQuotation.context);
    const [stIsShowModal, setStIsShowModal] = useState(false);
    const refSubmitBtn = useRef(null);
    const refPrintReceiptRef = useRef(null);
    const [stIsSaving, setStIsSaving] = useState(false);
    const [stOutOfStockProductList, setStOutOfStockProductList] = useState([]);
    const [stIsShowCompletedModal, setStIsShowCompletedModal] = useState(false);
    const [stCompletedOrder, setStCompletedOrder] = useState(null);
    const refShowConfirm = useRef(null);
    const [lstPrintPageSize] = useState(LIST_PAGE_SIZE);
    const [stIsPrint, setStIsPrint] = useState(false);
    const [stPrintPageSize, setStPrintPageSize] = useState(KEY_PRINT_A4);
    const [clickExport, setCickExport]=useState(false);

    const isEnabled = state.productList.filter(p => p.checked).length > 0

    useEffect(() => {
        printConfigs();
    }, [state.printEnabled]);

    useEffect(() => {
        findPickUpAddress();
    }, []);

    const printConfigs = (configs) => {
        if(configs) {
            //save to localStorage
            storageService.setToLocalStorage(Constants.ORDER_PRINT_CONFIG, JSON.stringify(configs));
            setStPrintPageSize(configs.pageSize)
        } else {
            const currentConfigs = storageService.getFromLocalStorage(Constants.ORDER_PRINT_CONFIG) || JSON.stringify({
                enabled: false,
                pageSize: KEY_PRINT_A4,
            });
            const printConfig =  JSON.parse(currentConfigs);
            setStIsPrint(printConfig.enabled);
            setStPrintPageSize(KEY_PRINT_A4)
        }
    }

    const findPickUpAddress = () => {
        const DEFAULT_COUNTRY_CODE = "VN";
        let oAddress = {
            address: "",
            ward: "",
            district: "",
            city: ""
        };
        const storeId = storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_ID);
        const getCities = catalogService.getCitesOfCountry(DEFAULT_COUNTRY_CODE);
        const getStoreInfo = storeService.getStorefrontInfo(storeId);
        let pmStoreInfo = cancelablePromise(Promise.all([getCities, getStoreInfo]));
        pmStoreInfo.promise.then(async (res) => {
            let pageAddress = res[1].pageAddress.length > 0 ? res[1].pageAddress[0] : {
                address: res[1].address,
                cityCode: res[1].city,
                districtCode: "",
                wardCode: res[1].ward, // district
                storeId: res[1].id
            };
            let exactPageAddress = {
                id: pageAddress.id,
                address: pageAddress.address,
                cityCode: pageAddress.cityCode,
                districtCode: pageAddress.wardCode,
                wardCode: pageAddress.districtCode,
                storeId: pageAddress.storeId
            };
            const city = res[0].find(city => {
                if(city.code === exactPageAddress.cityCode) return city;
            });
            oAddress.address = exactPageAddress.address;
            oAddress.city = city.inCountry;
            if (!_.isEmpty(exactPageAddress.cityCode)) {
                let pmDistricts = cancelablePromise(catalogService.getDistrictsOfCity(exactPageAddress.cityCode));
                pmDistricts.promise.then(districts => {
                    const district = districts.find(district => {
                        if(district.code === exactPageAddress.districtCode) return district;
                    });
                    oAddress.district = district.inCountry;
                    if (!_.isEmpty(exactPageAddress.districtCode)) {
                        let pmWards = cancelablePromise(catalogService.getWardsOfDistrict(exactPageAddress.districtCode));
                        pmWards.promise.then(wards => {
                            const ward = wards.find(ward => {
                                if(ward.code === exactPageAddress.wardCode) return ward;
                            });
                            oAddress.ward = ward.inCountry;
                            const addressValue = oAddress.address+" "+oAddress.ward+" "+oAddress.district+" "+oAddress.city;
                            dispatch(ContextQuotation.actions.setStoreInfo({storeAddress: addressValue}));
                        }, () => {
                        });
                    }
                }, () => {
                });
            }
        });

        // get custom domain
        storeService.getStoreUrl(Constants.StoreUrlType.STOREFRONT)
            .then(urlObj => {
                dispatch(ContextQuotation.actions.setStoreInfo({customDomain: urlObj.url}));

            })
    }

    const onClickCloseChangeStockModal = (e) => {
        setStIsShowModal(false)
    }

    const onSubmitQuantityModal = (e, values) => {
        const buildRequest = (values) => {
            let productList = []
            for (const [productId, index] of Object.entries(values).filter(entry => !entry[0].includes('currentStock-'))) {
                const currentStock = values[`currentStock-${productId}`]
                const [itemId, modelId] = productId.split('-')
                productList.push({
                    itemId,
                    modelId,
                    type: 'SET',
                    stock: values[productId],
                    currentStock: currentStock || 0,
                    actionType: 'FROM_UPDATE_AT_INSTORE_PURCHASE'
                })
            }
            return productList
        }
        setStIsSaving(true)
        const requestBody = buildRequest(values)
        ItemService.updateInStoreProductQuantity(requestBody)
            .then(result => {
                GSToast.commonUpdate()
                setStIsShowModal(false)
            })
            .catch(e => {
                GSToast.commonError()
            })
            .finally(() => {
                setStIsSaving(false)
            })
    }

    const isInValid = () => {

        // error
        let errors = {}
        let hasError = false

        // check data required
        const shipping = state.shippingInfo
        const user = state.user

        // check service id
        if(!shipping.serviceId) {errors.serviceId = true; hasError = true}

        // check required field
        if(shipping.method === 'DELIVERY' ){
            // check when dilivery
            if(!user.name) {errors.name = true; hasError = true}

            if(!user.phone) {
                errors.phone = 'common.validation.required'; 
                hasError = true
            }else if(user.phone.length < 8 || user.phone.length > 15){
                errors.phone = 'common.validation.invalid.phone'; 
                hasError = true
            }else if( !(/^[+\d](?:.*\d)?$/.test(user.phone))){
                errors.phone = 'common.validation.invalid.phone'; 
                hasError = true
            }else{
                errors.phone = '';
            }

            if(!shipping.address) {errors.address = true; hasError = true}
            if(!shipping.city) {errors.city = true; hasError = true}
            if(!shipping.district) {errors.district = true; hasError = true}

            if(shipping.option === 'AUTO_FILL'){
                if(!shipping.length) {errors.length = true; hasError = true}
                if(!shipping.width) {errors.width = true; hasError = true}
                if(!shipping.height) {errors.height = true; hasError = true}
                if(!shipping.weight) {errors.weight = true; hasError = true}
            }
        }

        dispatch(ContextQuotation.actions.setErrors(errors)) 

        if(state.paymentMethod === Constants.ORDER_PAYMENT_METHOD_MPOS && !state.mposCode){
            hasError = true

            // show alert
            refShowConfirm.current.openModal({
                type: AlertModalType.ALERT_TYPE_DANGER,
                messages: i18next.t('page.order.create.complete.pos_confirm'),
                modalTitle: i18next.t('page.order.create.complete.pos_confirm_title'),
                closeCallback: () => {
                }
            })

            document.getElementById("instoreposcode").focus()
        }

        return hasError;
    }

    // const createExcel = () =>{

        // // validate the data here
        // if(isInValid()){
        //     return;
        // }
        
        // const shipping = state.shippingInfo

        // // need user info to delivery
        // if(shipping.method === 'DELIVERY'){
        //     if(!state.buyerId && !state.user.name){
        //         refShowConfirm.current.openModal({
        //             type: AlertModalType.ALERT_TYPE_DANGER,
        //             messages: (<GSTrans t="page.order.create.complete.user_confirm">
        //             Missing customer information.<br/>Customer information is required for shipping. Please select "Guest checkout" or "Add customer" to complete this order.
        //         </GSTrans>),
        //             closeCallback: () => {
        //             }
        //         })
        //         return;
        //     }
        // }

        // // valid case
        // createOrderMain()
        // let dataExcel=[];
        // for(const product of state.productList){
        //     dataExcel.push({image:product.image})
        // }
        
    // }

    const setNote = (e, value) =>{
        dispatch(ContextQuotation.actions.setNote(value))
    }

    const onClickGoToDetail = () => {
        RouteUtils.redirectWithoutReload(props, NAV_PATH.orderDetail + `/gosell/${stCompletedOrder.orderInfo.orderId}`)
    }

    const onClickStayHere = () => {
        dispatch(ContextQuotation.actions.reset())
        setStIsShowCompletedModal(false)
    }

    const onChangePrintPageSize = (e) => {
        const {value} = e.currentTarget;
        state.lstPrintPageSize = value;
        setStPrintPageSize(value)
        //todo save to localstorage
        printConfigs({enabled: stIsPrint, pageSize: value});
    }

    const updateCustomerBranch = async (branchId, customerId) => {
        beehiveService.updateCustomerBranch(branchId, customerId);
    }
   
    const createTableProduct = (state) => {
        const tableProduct=[];
        let i=1;
        state.productList.map(product=>{
            tableProduct.push({no:i++,image:product.itemImage,productName:product.itemName,modelName:product.modelName,quantity:product.quantity,unitPrice:(Number (product.price)).toLocaleString(),totalPrice:(product.price*product.quantity).toLocaleString()})
        })
        return tableProduct;
    }

    const createTableBill = (state) => {
        const bill={
            subtotal: NumberUtils.formatPrecisionByCurrency(ContextQuotationService.calculateSubTotalPrice(state.productList, state.shippingInfo, state.promotion)),
            VAT: NumberUtils.formatPrecisionByCurrency(Number (state.totalVATAmount)),
            total: NumberUtils.formatPrecisionByCurrency(ContextQuotationService.calculateTotalPrice(state.productList, state.shippingInfo, state.promotion, state.membership, state.totalVATAmount)),
        }
        return bill;
    }

    const createTableCustomer = (state) => {
        var tableCustomer={
            name:"",
            email:"",
            phone:""
        }
        if(state.user.userId){
            tableCustomer={
                name: state.user.name,
                email: state.user.email,
                phone: "'"+state.user.phone
            };
            
        }
        
        return tableCustomer;
        
    }

    const createTableStore = () => {
        const tableStore={
            storeName: CredentialUtils.getStoreName(),
            storePhone: "'"+CredentialUtils.getStorePhone(),
            storeEmail: CredentialUtils.getStoreEmail()
        }
        return tableStore
    }

    const renderDataTable = (state) => {
        if (state.productList.length!= 0){
            const tableProduct=createTableProduct(state);
            const tableBill=createTableBill(state);
            const tableCustomer=createTableCustomer(state);
            const tableStore=createTableStore();
            return (
                <table id="export-table-id" style={{display:'none'}}>
                <tr>
                    <td>{i18next.t('page.order.list.exportQuotationStoreName')}</td>
                    <td>{tableStore.storeName}</td>
                    
                </tr>
                <tr>
                    <td>{i18next.t('page.order.list.exportQuotationStorePhone')}</td>

                    <td>{tableStore.storePhone}</td>
                </tr>
                <tr>
                <td>{i18next.t('page.order.list.exportQuotationStoreEmail')}</td>

                    <td>{tableStore.storeEmail}</td>
                </tr>
                <tr></tr>
                <tr>
                <td>{i18next.t('page.order.list.exportQuotationCustomerInformation')}</td>
                    
                </tr>
                <tr>
                <td>{i18next.t('page.order.list.exportQuotationCustomerName')}</td>

                    <td>{tableCustomer.name}</td>
                </tr>
                <tr>
                    <td>{i18next.t('page.order.list.exportQuotationStorePhone')}</td>

                    <td>{tableCustomer.phone}</td>
                </tr>
                <tr>
                <td>{i18next.t('page.order.list.exportQuotationStoreEmail')}</td>

                    <td>{tableCustomer.email}</td>
                </tr>
                <tr>
                <td>{i18next.t('page.order.list.exportQuotationProductNo')}</td>
                <td>{i18next.t('page.order.list.exportQuotationProductImage')}</td>
                <td>{i18next.t('page.order.list.exportQuotationProductName')}</td>
                <td>{i18next.t('page.order.list.exportQuotationProductQuantity')}</td>
                <td>{i18next.t('page.order.list.exportQuotationProductUnitPrice')}</td>
                <td>{i18next.t('page.order.list.exportQuotationProductTotalPrice')}</td>

                 
                </tr>
                {
                tableProduct.map(product=>{
                    return (
                        <tr>
                            <td>{product.no}</td>
                            <td>{product.image}</td>
                            <td>{product.modelName?(product.productName+" | "+product.modelName):(product.productName)}</td>
                            <td>{product.quantity}</td>
                            <td>{product.unitPrice}</td>
                            <td>{product.totalPrice}</td>
                        </tr>
                    )
                })}
                <tr>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                <td>{i18next.t('page.order.list.exportQuotationBillSubtotal')}</td>

                    <td>{tableBill.subtotal}</td>
                </tr>
                <tr>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td>{i18next.t('page.order.list.exportQuotationBillVAT')}</td>

                    <td>{tableBill.VAT}</td>
                </tr>
                <tr>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td>{i18next.t('page.order.list.exportQuotationBillTotal')}</td>

                    <td>{tableBill.total}</td>
                </tr>
                
            </table>
            )
        }
       
        return 
    }

    const exportCSV = () => {
        // setCickExport(true)
        // if(clickExport){
            let newDate=new Date()
            const fileName =i18next.t('page.order.list.fileExportQuotation')
            const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
            const fileExtension = '.xlsx';
            const ws = XLSX.utils.table_to_sheet(document.getElementById('export-table-id'), {raw:true});
            const wb = { Sheets: { 'data': ws }, SheetNames: ['data'] };
            const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
            const data = new Blob([excelBuffer], {type: fileType});
            FileSaver.saveAs(data, fileName+newDate.getDate()+"_"+(Number (newDate.getMonth())+1)+"_"+newDate.getFullYear() + fileExtension);
            setCickExport(false)
        // }
        
    }

    return(
        <>
            {stIsSaving && <LoadingScreen zIndex={1051}/>}
            {/*COMPLETED MODAL*/}
            <Modal isOpen={stIsShowCompletedModal}>
                <ModalHeader  className="color-green">
                    <GSTrans t="page.order.instorePurchase.createdSuccessfully"/>
                </ModalHeader>
                <ModalBody>
                    <GSTrans t="page.order.instorePurchase.chooseNextAction"/>
                </ModalBody>
                <ModalFooter>
                    <GSButton default onClick={onClickGoToDetail}>
                        <GSTrans t="page.order.instorePurchase.goToDetail"/>
                    </GSButton>
                    <GSButton success marginLeft onClick={onClickStayHere}>
                        <GSTrans t="page.order.instorePurchase.createNewOrder"/>
                    </GSButton>
                </ModalFooter>
            </Modal>

            {/*THE BUYER DOES NOT HAVE A PHONE NUMBER */}
            {/* <Modal isOpen={missingPhoneOpen} className="update-missing__phone-number-modal">
                <ModalHeader  className="color-green">
                    <GSTrans t="page.order.instorePurchase.nophone.title"/>
                </ModalHeader>
                <ModalBody>
                    <div className="update-missing__phone-number-modal__body">
                        <span style={{marginBottom: "15px"}}><GSTrans t="page.order.instorePurchase.nophone.content"/></span>
                        <Label for={'phone_missing'} className="gs-frm-control__title">
                            <GSTrans t="common.txt.phone"/>
                        </Label>
                        <UikInput
                            onChange={(e, value) => fillMissingPhone(e, value)}
                            defaultValue={state.user.phone}
                            className="phone_missing"
                            name="phone_missing"
                            placeholder={i18next.t("common.txt.phone")}                        />
                        {
                        (invalidPhone && state.user.phone) &&
                        <AlertInline 
                            className="product-item__type-error"
                            type={AlertInlineType.ERROR}
                            nonIcon
                            text={i18next.t('common.validation.invalid.phone')}/>
                    }
                    </div>
                    
                </ModalBody>
                <ModalFooter>
                    <GSButton success marginLeft onClick={createOrder}>
                        <GSTrans t="page.order.instorePurchase.nophone.button.ok"/>
                    </GSButton>
                    <GSButton default marginLeft onClick={() => {setMissingPhoneOpen(false)}}>
                        <GSTrans t="common.btn.cancel"/>
                    </GSButton>
                </ModalFooter>
            </Modal> */}

            {/*ADJUST STOCK MODAL*/}
            <Modal isOpen={stIsShowModal} className="quotation-in-store-purchase-complete quotation-in-store-purchase-complete__quantity-modal">
                <ModalHeader>
                    <h6 className="mb-1">
                        <GSTrans t="page.order.create.complete.quantityModal.title"/>
                    </h6>
                    <p className="font-size-14px color-gray">
                        <GSTrans t="page.order.create.complete.quantityModal.subTitle"/>
                    </p>
                </ModalHeader>
                <ModalBody className="mt-0 pt-0">
                    <AvForm onValidSubmit={onSubmitQuantityModal} className="quotation-in-store-purchase-complete__product-form gs-atm__scrollbar-1">
                        <button ref={refSubmitBtn} hidden/>
                        <UikWidgetTable className="quotation-in-store-purchase-complete__product-table">
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
                                                    <h6 className="mb-0 quotation-in-store-purchase-complete__table-product-name">
                                                        {product.name}
                                                    </h6>
                                                    {product.modelName &&
                                                        <p className="color-gray font-size-14px mb-0">
                                                            {product.modelName}
                                                        </p>
                                                    }
                                                </div>
                                            </td>
                                            <td className="text-center">
                                                <span className="color-gray">
                                                    {CurrencyUtils.formatMoneyByCurrency(product.price, product.currency)}
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
                                                                value={product.quantity}
                                                                parentClassName="quotation-in-store-purchase-complete__input-stock"

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
            <GSWidget className="quotation-in-store-purchase-complete">
                <GSWidgetContent className=" d-flex flex-column w-100">
                    <div className="d-flex flex-column justify-content-between mb-3">
                        {/* <Label><GSTrans t="page.order.create.complete.note"/></Label>
                        <AvForm>
                        <AvField 
                            name="note"
                            type="textarea"
                            rows={3}
                            value={state.note}
                            onBlur={(e, value) => setNote(e, value)}
                            validate={{maxLength: {value: 500}}}
                        />
                        </AvForm> */}
                    </div >
                    {/*SUBTOTAL*/}
                    
                    <div className="d-flex justify-content-between align-items-center mb-3 ">
                        <p style={{margin: 'auto 0'}}>
                            <GSTrans t={"page.order.list.subTotalQuotation"} values={{x:state.productList.length}}/>
                        </p>
                        <b>
                            {CurrencyUtils.formatMoneyByCurrency(
                                ContextQuotationService.calculateSubTotalPrice(state.productList, state.shippingInfo, state.promotion),
                                STORE_CURRENCY_SYMBOL
                            )}
                        </b>
                    </div>
                    {/*VAT*/}
                               
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <p style={{margin: 'auto 0'}}>VAT</p>
                            <span>
                                {CurrencyUtils.formatMoneyByCurrency(
                                    ContextQuotationService.calculateVAT(state.totalVATAmount),
                                    STORE_CURRENCY_SYMBOL
                                )}
                            </span>
                        </div>
                    {/*DISCOUNT*/}
                    {/* {ContextQuotationService.calculateDiscountAmount(state.productList, state.promotion, state.membership) > 0 &&
                    <div className="d-flex justify-content-between align-items-center mb-3 color-gray font-weight-500">
                        <b>
                            <GSTrans t={"page.order.detail.items.discount"}/>
                        </b>

                        <span>
                            {'- '}
                            {CurrencyUtils.formatMoneyByCurrency(
                                ContextQuotationService.calculateDiscountAmount(state.productList, state.promotion, state.membership),
                                CurrencySymbol.VND
                            )}
                        </span>
                    </div>
                    } */}
                    
                    <div className="d-flex justify-content-between align-items-center mb-3 pt-3" style={{borderTop: '1px solid #93939357'}}>
                        <b>
                            <GSTrans t={"page.order.list.totalQuotation"} values={{x:state.productList.length}}/>
                        </b>

                        <span className="quotation-in-store-purchase-complete__total-price">
                            {CurrencyUtils.formatMoneyByCurrency(
                                ContextQuotationService.calculateTotalPrice(state.productList, state.shippingInfo, state.promotion, state.membership, state.totalVATAmount),
                                STORE_CURRENCY_SYMBOL
                            )}
                        </span>
                    </div>
                    {(state)?renderDataTable(state):null}
                    <GSButton success
                            className="text-uppercase w-100 mt-2"
                            onClick={exportCSV}
                            disabled={!isEnabled}>
                        <GSTrans t="page.order.list.exportQuotation"/>
                    </GSButton>
                </GSWidgetContent>
            </GSWidget>
            <AlertModal ref={refShowConfirm}/>
        </>

    )
}
QuotationComplete.propTypes = {

};
export default QuotationComplete;