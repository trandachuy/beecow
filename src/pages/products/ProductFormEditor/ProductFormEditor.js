/*******************************************************************************
 * Copyright 2019 (C) Mediastep Software Inc.
 *
 * Created on : 27/03/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React from "react";
import {UikButton, UikCheckbox, UikFormInputGroup, UikRadio, UikSelect, UikTag} from '../../../@uik';
import AvFieldCountable from "../../../components/shared/form/CountableAvField/AvFieldCountable";
import {AvField, AvForm} from 'availity-reactstrap-validation';
import '../../../../sass/ui/_gswidget.sass';
import '../../../../sass/ui/_gsfrm.sass';
import './ImageView.sass';
import Label from "reactstrap/es/Label";
import ImageUploader, {ImageUploadType} from "../../../components/shared/form/ImageUploader/ImageUploader";
import './ProductFormEditor.sass';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import CryStrapInput, {CurrencySymbol} from "../../../components/shared/form/CryStrapInput/CryStrapInput";
import Dropzone from "react-dropzone";
import AlertInline, {AlertInlineType} from "../../../components/shared/AlertInline/AlertInline";
import mediaService, {MediaServiceDomain} from "../../../services/MediaService";
import {ItemService} from "../../../services/ItemService";
import {Trans} from "react-i18next";
import i18next from "../../../config/i18n";
import AlertModal, {AlertModalType} from "../../../components/shared/AlertModal/AlertModal";
import Constants from "../../../config/Constant";
import {Link, Redirect} from "react-router-dom";
import ConfirmModal from "../../../components/shared/ConfirmModal/ConfirmModal";
import ConfirmModalChildren from "../../../components/shared/ConfirmModalChildren/ConfirmModalChildren";
import storageService from "../../../services/storage";
import {ImageUtils} from "../../../utils/image";
import GSContentHeader from "../../../components/layout/contentHeader/GSContentHeader";
import GSContentBody from "../../../components/layout/contentBody/GSContentBody";
import GSContentContainer from "../../../components/layout/contentContainer/GSContentContainer";
import {calculateDiscount, PricingUtils} from "../../../utils/pricing";
import GSComponentTooltip, {GSComponentTooltipPlacement} from "../../../components/shared/GSComponentTooltip/GSComponentTooltip";
import shopeeService from "../../../services/ShopeeService";
import {lazadaService} from "../../../services/LazadaService";
import {RouteUtils} from "../../../utils/route";
import GSTrans from "../../../components/shared/GSTrans/GSTrans";
import {GSToast} from "../../../utils/gs-toast";
import {any, array, arrayOf, bool, func, number, shape, string} from "prop-types";
import {NAV_PATH} from "../../../components/layout/navigation/Navigation";
import GSEditor from "../../../components/shared/GSEditor/GSEditor";
import GSButton from "../../../components/shared/GSButton/GSButton";
import {CredentialUtils} from "../../../utils/credential";
import storeService from "../../../services/StoreService";
import AvFieldCurrency from "../../../components/shared/AvFieldCurrency/AvFieldCurrency";
import {FormValidate} from "../../../config/form-validate";
import AvCustomCheckbox from "../../../components/shared/AvCustomCheckbox/AvCustomCheckbox";
import Row from "reactstrap/es/Row";
import Col from "reactstrap/es/Col";
import PrivateComponent from "../../../components/shared/PrivateComponent/PrivateComponent";
import ProductFormEditorBeecowCategoryModal from "./BeecowCategoryModal/ProductFormEditorBeecowCategoryModal";
import {PACKAGE_FEATURE_CODES} from "../../../config/package-features";
import {TokenUtils} from "../../../utils/token";
import SEOEditor from "../../seo/SEOEditor";
import GSWidget from "../../../components/shared/form/GSWidget/GSWidget";
import GSWidgetHeader from "../../../components/shared/form/GSWidget/GSWidgetHeader";
import GSWidgetContent from "../../../components/shared/form/GSWidget/GSWidgetContent";
import GSTooltip from "../../../components/shared/GSTooltip/GSTooltip";
import ProductFormCollectionSelector2 from "./CollectionSelector/ProductFormCollectionSelector2";
import GSFakeLink from "../../../components/shared/GSFakeLink/GSFakeLink";
import ProductFormVariationSelector from "./VariationSelector/ProductFormVariationSelector";
import ProductFormDepositSelector from "./DepositSelector/ProductFormDepositSelector";
import {UpdateStockRequestBodyInventoryModel} from "../../../models/UpdateStockRequestBody.model";
import tikiService from "../../../services/TikiService";
import RemainingSoldItemModal from "./RemainingSoldItemModal/RemainingSoldItemModal";
import ProductMultipleBranchStockEditorModal
    from "./MultipleBranchStockEditorModal/ProductMultipleBranchStockEditorModal";
import {InventoryEnum} from "../InventoryList/InventoryEnum";
import ProductMultipleBranchSKUEditorModal from "./MultipleBranchSKUEditorModal/ProductMultipleBranchSKUEditorModal";
import {CurrencyUtils, NumberUtils} from "../../../utils/number-format";
import {ProductContext} from "../Context/ProductContext";
import Modal from "reactstrap/es/Modal";
import {ModalBody, ModalFooter, ModalHeader} from "reactstrap";
import ProductTranslateModal from "../productsModal/ProductTranslateModal";
import HintPopupVideo from "../../../components/shared/HintPopupVideo/HintPopupVideo";
import {ItemUtils} from "../../../utils/item-utils";
import GSAlertBox from "../../../components/shared/GSAlertBox/GSAlertBox";
import ManagedInventoryModal from "./managedInventoryModal/ManagedInventoryModal";
import {NavigationPath} from "../../../config/NavigationPath";
import {debounce} from 'lodash';
import Loading, {LoadingStyle} from "../../../components/shared/Loading/Loading";
import DropdownSearchForm from "./DropdownSearchForm/DropdownSearchForm";
import ExclamationTriangle from "../../../components/shared/GSSvgIcon/ExclamationTriangle";
import HocSEOEditor from '../../seo/hoc/HocSEOEditor'

export const ProductFormEditorMode = {
    ADD_NEW: 'addNew',
    EDIT: 'edit'
}
export const renderNewPageMode = {
    WHOLESALE_PAGE: 'wholesalePage',
    CONVERSION_UNIT_PAGE: 'conversionUnitPage',

}
export const VariationEditorMode = {
    ADD_NEW_ROW: 'addNewRow',
    REMOVE_ROW: 'removeRow',
    ADD_NEW_ITEM: 'addNewItem',
    REMOVE_ITEM: 'removeItem',
    CHANGE_ITEM: 'changeItem'
}

const ProductModelKey = {
    ID: "id",
    NAME: "name",
    CATE_ID: "cateId",
    ITEM_TYPE: "itemType",
    CURRENCY: "currency",
    DESCRIPTION: "description",
    DISCOUNT: "discount",
    COST_PRICE: "costPrice",
    ORG_PRICE: "orgPrice",
    NEW_PRICE: "newPrice",
    TOTAL_COMMENT: "totalComment",
    TOTAL_LIKE: "totalLike",
    IMAGES: "images",
    TOTAL_ITEM: "totalItem",
    SHIPPING_INFO: "shippingInfo",
    CATEGORIES: "categories",
    PARENT_SKU: "parentSku",
    BARCODE: "barcode",
    MODELS: "models",
    QUANTITY_CHANGED: "quantityChanged",
    BCOIN: "bcoin",
    IS_SELF_DELIVERY: "isSelfDelivery",
    SOLD_ITEMS: "soldItem",
    PRIORITY: "priority",
    SHOW_OUT_OF_STOCK: "showOutOfStock",
    SEO_TITLE: 'seoTitle',
    SEO_DESCRIPTION: 'seoDescription',
    SEO_KEYWORDS: 'seoKeywords',
    SEO_URL: 'seoUrl',
    IS_HIDE_STOCK: 'isHideStock',
    ITEM_MODE_CODE: 'itemModelCodeDTOS',
    NAME_UNIT: 'conversionUnitName',
    ID_UNIT: 'conversionUnitId'

}
const SHOPEE_SYNC_TYPE = {
    CREATE_NEW: 'CREATE_NEW',
    UPDATE: 'UPDATE'
}


const MANAGE_INVENTORY = [
    {
        value: 'PRODUCT',
        label: i18next.t('page.product.allProduct.productDetail.byProduct')
    },
    {
        value: 'IMEI_SERIAL_NUMBER',
        label: i18next.t('page.product.allProduct.productDetail.IMEISerial')
    }
]

class ProductFormEditor extends React.Component {
    OTHER_CATEGORY_ID_LVL1 = 1014
    OTHER_CATEGORY_ID_LVL2 = 1680

    constructor(props) {
        super(props)
        this.itemId = this.props.itemId
        this.IMAGE_MAX_LENGTH = 50
        this.IMAGE_MIN_LENGTH = 1
        this.IMAGE_MAX_SIZE_BY_MB = 10;
        this.isReSeller = CredentialUtils.ROLE.RESELLER.isReSeller()
        this.isProductBelongSeller = this.props.commissionList.length > 0
        // only disable when store is reseller and product belong seller and seller allow to edit
        this.disabledUpdatePrice = this.props.mode === ProductFormEditorMode.EDIT && !CredentialUtils.ROLE.RESELLER.allowUpdatedPrice() && this.isReSeller && this.isProductBelongSeller
        this.disabledUpdateStock = false;
        this.disabledUpdateVariation = this.props.commissionList.length > 0
        this.isReSellerCommission = this.props.commissionList.length > 0

        this.state = {
            showOutOfStock: this.defaultValue(ProductModelKey.SHOW_OUT_OF_STOCK, true),
            prodImageList: [],
            prodImageMain: -1,
            isValidImageAmount: true,
            isValidBarcode: true,
            isValidCate: true,
            isSaving: false,
            isSavingFailed: false,
            onRedirect: false,
            isActive: true,
            isValid: true,
            prodCostPrice: this.defaultValue(ProductModelKey.COST_PRICE, 0),
            prodPrice: this.defaultValue(ProductModelKey.ORG_PRICE, 0),
            prodDiscountPrice: this.defaultValue(ProductModelKey.NEW_PRICE, 0),
            symbolCode: CurrencyUtils.getLocalStorageSymbol(),
            varLength: 0,
            depositLength: 0,
            isShopeeSynced: false,
            isLazadaSynced: false,
            isTikiSynced: false,
            directToShopee: false,
            directToShopeeAccountManagement: false,
            directToTiki: false,
            linkToBeecowCateId: this.props.item ? this.props.item.cateId : this.OTHER_CATEGORY_ID_LVL2,
            linkToBeecowCategories: [],
            shopeeStatus: false,
            lazadaStatus: false,
            tikiStatus: false,
            redirectToCollection: false,
            isCollectionFetchingComplete: false,
            collectionList: {
                addList: [],
                removeList: []
            },
            isShowBeecowCategoryModal: false,
            variationRows: [],
            redirectToVariation: '',
            isShowUpdateStock: false,
            isShowUpdateSKU: false,
            updateStockData: [],
            prodName: this.defaultValue(ProductModelKey.NAME, ''),
            onSaveStock: false,
            stockDataRow: [],
            stockUpdateMode: '',
            branchStock: null,
            toggleRemainingSoldItemModal: false,
            toggleSoldCountModal: false,
            selectedBranches: this.props.branchList.map(b => b.id),
            lstInventory: this.getDefaultInventories(),
            listVAT: [],
            defaultVAT: {
                label: "",
                value: ""
            },
            barcodeVariationList: [],
            barcodeDepositList: [],
            shopeeAccountList: [],
            isShowShopeeSyncTypeModal: false,
            shopeeSyncType: SHOPEE_SYNC_TYPE.CREATE_NEW,
            isModalSave: false,
            onChange: false,
            afterSavedItem: undefined,
            itemLanguages: this.props.item ? this.props.item.languages : [],
            itemModels: this.props.item ? this.props.item.models : [],
            onWeb: true,
            onApp: TokenUtils.hasAllPackageFeatures([PACKAGE_FEATURE_CODES.APP_PACKAGE]),
            inStore: TokenUtils.hasAllPackageFeatures([PACKAGE_FEATURE_CODES.POS_PACKAGE]),
            inGosocial: TokenUtils.hasAllPackageFeatures([PACKAGE_FEATURE_CODES.SOCIAL_PACKAGE]),
            isValidPlatform: true,
            storeListing: undefined,
            enabledListing: false,
            manageInventory: MANAGE_INVENTORY[0].value,
            isOpenManagedInventoryModal: false,
            switchManagedInventorySaveList: [],
            isHideStock: this.defaultValue(ProductModelKey.IS_HIDE_STOCK, false),
            itemModelCodeDTOS: [],
            manageInventoryLstInventory: [],
            branchIds: [],
            isConfigWholesalePrice: false,
            errorValidSellingPrice: '',
            isRemoveWholesalePrice: false,
            isUpdateWholesalePrice: false,
            createdItemId: this.props.item ? this.props.item.id : '',
            isCheckRemoveWholesaleItem: false,
            isPromotionCampaign: (this.props.isFlashSaleCampaign || this.props.isWholesaleCampaign) ? true : false,
            totalModelWholesale: 0,
            onChangeImeiModal: false,
            unitId: this.defaultValue(ProductModelKey.ID_UNIT, null),
            unitName: this.defaultValue(ProductModelKey.NAME_UNIT, ''),
            isConfigConversionUnit: false,
            conversionUnitError: '',
            isRemoveConversionUnit: false,
            isFetchingConversion: false,
            conversionUnitList: [],
            totalConversionUnitItem: 0,
            totalVariationConfigUnitItem: [],
            isCheckRemoveConversionUnit: false,
            variationRemoveList: [],
            unitSelected: []

        }
        this.onImageUploaded = this.onImageUploaded.bind(this)
        this.onRemoveImage = this.onRemoveImage.bind(this)
        this.isMainImage = this.isMainImage.bind(this)
        this.onSelectMainImage = this.onSelectMainImage.bind(this)
        this.onImageDrop = this.onImageDrop.bind(this)
        this.handleOnSaveSubmit = this.handleOnSaveSubmit.bind(this)
        this.isAllFieldValid = this.isAllFieldValid.bind(this)
        this.uploadImageToServer = this.uploadImageToServer.bind(this)
        this.formatImageData = this.formatImageData.bind(this)
        this.handleOnCancel = this.handleOnCancel.bind(this)
        this.defaultValue = this.defaultValue.bind(this)
        this.defaultValueWithParent = this.defaultValueWithParent.bind(this)
        this.onToggleActive = this.onToggleActive.bind(this)
        this.redirectToProductList = this.redirectToProductList.bind(this)
        this.onClickRemove = this.onClickRemove.bind(this)
        this.onChangePrice = this.onChangePrice.bind(this)
        this.onVariationLengthChange = this.onVariationLengthChange.bind(this)
        this.onCateValidCallback = this.onCateValidCallback.bind(this)
        this.setIconByBhSatus = this.setIconByBhSatus.bind(this);
        this.unSaveModal = this.unSaveModal.bind(this);
        this.redirectToCollection = this.redirectToCollection.bind(this);
        this.redirectToCollectionWithSave = this.redirectToCollectionWithSave.bind(this);
        this.onCollectionChange = this.onCollectionChange.bind(this);
        this.onCollectionFetchingComplete = this.onCollectionFetchingComplete.bind(this);
        this.changeShowOutOfStock = this.changeShowOutOfStock.bind(this);
        this.changeIsHideStock = this.changeIsHideStock.bind(this);
        this.onClickPlatform = this.onClickPlatform.bind(this);
        this.onCheckPlatformValid = this.onCheckPlatformValid.bind(this);
        this.linkToBeecowChannel = this.linkToBeecowChannel.bind(this);
        this.onOkLinkToBeecow = this.onOkLinkToBeecow.bind(this);
        this.redirectToProduct = this.redirectToProduct.bind(this);
        this.onDepositLengthChange = this.onDepositLengthChange.bind(this);
        this.onChangeVariationRow = this.onChangeVariationRow.bind(this);
        this.checkVariationDataForWholesale = this.checkVariationDataForWholesale.bind(this);
        this.createProductModelRequest = this.createProductModelRequest.bind(this);
        this.onClickEditVariation = this.onClickEditVariation.bind(this);
        this.redirectToVariation = this.redirectToVariation.bind(this);
        this.onChangeProdName = this.onChangeProdName.bind(this);
        this.onCloseUpdateStockModal = this.onCloseUpdateStockModal.bind(this);
        this.getDataForUpdateStock = this.getDataForUpdateStock.bind(this);
        this.onSaveStock = this.onSaveStock.bind(this);
        this.startCreateNewItemTask = this.startCreateNewItemTask.bind(this);
        this.createStock = this.createStock.bind(this);
        this.calculateRemainingStock = this.calculateRemainingStock.bind(this);
        this.handleApplyAllBranches = this.handleApplyAllBranches.bind(this);
        this.getModelForMultipleBranchUpdate = this.getModelForMultipleBranchUpdate.bind(this);
        this.getDefaultInventories = this.getDefaultInventories.bind(this);
        this.getDefaultBranchStock = this.getDefaultBranchStock.bind(this);
        this.handleChangeBranchStock = this.handleChangeBranchStock.bind(this);
        this.calculateRemainingStockByBranch = this.calculateRemainingStockByBranch.bind(this);
        this.calculateSoldCountByBranch = this.calculateSoldCountByBranch.bind(this);
        this.onCloseUpdateSKUModal = this.onCloseUpdateSKUModal.bind(this);
        this.onSaveSKU = this.onSaveSKU.bind(this);
        this.isHasLinkedProduct = this.isHasLinkedProduct.bind(this);
        this.isHasNewShopeeAccount = this.isHasNewShopeeAccount.bind(this);
        this.startEditItemTask = this.startEditItemTask.bind(this);
        this.toggleShopeeSyncTypeModal = this.toggleShopeeSyncTypeModal.bind(this);
        this.onChangeShopeeSyncType = this.onChangeShopeeSyncType.bind(this);
        this.onShopeeSyncModeConfirm = this.onShopeeSyncModeConfirm.bind(this);
        this.linkToShopeeChannel = this.linkToShopeeChannel.bind(this);
        this.onFormChange = this.onFormChange.bind(this);
        this.onFormChangeImeiModal = this.onFormChangeImeiModal.bind(this);
        this.syncToShopeeWithoutSave = this.syncToShopeeWithoutSave.bind(this);
        this.syncToShopeeWithSave = this.syncToShopeeWithSave.bind(this);
        this.handleSelectedVAT = this.handleSelectedVAT.bind(this);
        this.onSave = this.onSave.bind(this);
        this.handleOkResync = this.handleOkResync.bind(this);
        this.handleTranslateSuccess = this.handleTranslateSuccess.bind(this);
        this.handleCheckEnabledListing = this.handleCheckEnabledListing.bind(this);
        this.renderCommissionAlert = this.renderCommissionAlert.bind(this);
        this.handleChangeManageInventory = this.handleChangeManageInventory.bind(this)
        this.handleOpenManagedInventoryModal = this.handleOpenManagedInventoryModal.bind(this)
        this.handleManagedInventoryCallback = this.handleManagedInventoryCallback.bind(this)
        this.getDataForUpdateStockManagedInventory = this.getDataForUpdateStockManagedInventory.bind(this)
        // this.handleCheckAddUnit = this.handleCheckAddUnit.bind(this)
        this.handleChangeUnit = this.handleChangeUnit.bind(this)
        // this.ref
        this.refProdCostPrice = React.createRef()
        this.refProdPrice = React.createRef()
        this.refProdSku = React.createRef()
        this.refProdStock = React.createRef()
        this.refProdCategory = React.createRef()
        this.refProdDiscount = React.createRef()
        this.refProdWeight = React.createRef()
        this.refProdHeight = React.createRef()
        this.refProdLength = React.createRef()
        this.refProdWidth = React.createRef()
        this.refProdVariation = React.createRef();
        this.refProdDeposit = React.createRef();
        this.refSEOUrl = React.createRef();
        // frm
        this.ipSku = ''
        this.ipBarcode = ''
        // flag
        this.isCheckValidOnly = false
        this.isShopeeSync();
        this.isLazadaSync();
        this.totalWholeSaleList = 0
        this.groupItemModelWholesale = this.props.groupItemModelWholesale
        this.channel = new BroadcastChannel(Constants.CHANNEL_PRODUCT_DETAIL)
        // this.isTikiSync();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.branchList !== this.props.branchList) {
            this.setState({
                lstInventory: this.getDefaultInventories()
            })
        }

        if (prevState.manageInventory !== this.state.manageInventory) {
            const index = this.state.switchManagedInventorySaveList.findIndex(manageInventory => manageInventory.value == this.state.manageInventory)
            if (index == -1) {
                this.setState(state => ({
                    lstInventory: state.lstInventory.map(inv => ({
                        ...inv,
                        inventoryStock: 0,
                    }))
                }))
            } else {
                this.setState({
                    lstInventory: this.state.switchManagedInventorySaveList[index].lstInventory
                })
            }
        }

        if (prevState.manageInventory !== this.state.manageInventory || prevState.lstInventory !== this.state.lstInventory) {
            setTimeout(() => {
                const indexState = this.state.switchManagedInventorySaveList.findIndex(manageInventory => manageInventory.value == this.state.manageInventory)
                if (indexState === -1) {
                    const data = {
                        value: this.state.manageInventory,
                        lstInventory: this.state.lstInventory
                    }

                    let switchManagedInventorySaveList = [data, ...this.state.switchManagedInventorySaveList]
                    const index = switchManagedInventorySaveList.findIndex(manageInventory => manageInventory.value == this.state.manageInventory)
                    if (index != -1) {
                        switchManagedInventorySaveList[index].lstInventory = this.state.lstInventory
                        this.setState({
                            switchManagedInventorySaveList: switchManagedInventorySaveList
                        })

                    }
                } else {
                    let switchManagedInventorySaveList = [...this.state.switchManagedInventorySaveList]
                    const index = switchManagedInventorySaveList.findIndex(manageInventory => manageInventory.value == this.state.manageInventory)
                    if (index != -1) {
                        switchManagedInventorySaveList[index].lstInventory = this.state.lstInventory
                        this.setState({
                            switchManagedInventorySaveList: switchManagedInventorySaveList
                        })

                    }
                }

            }, 10)
        }


    }

    validateVariationForWholesale() {
        let errorValidSellingPrice = this.state.errorValidSellingPrice

        const variationList = this.refProdVariation.current.getValue()
        if (variationList.length < 1) {
            if (this.state.prodDiscountPrice === 0) {
                errorValidSellingPrice = i18next.t('component.product.addNew.whoSalePrice.errorCheckPriceProduct')
            } else {
                errorValidSellingPrice = ''
            }
        }

        if (this.checkSellingPriceForWholesale()) {
            errorValidSellingPrice = i18next.t('component.product.addNew.whoSalePrice.errorCheckPriceProduct')
            // isConfigWholesalePrice = false
        }

        this.setState({
            errorValidSellingPrice: errorValidSellingPrice
        })
    }

    changeConfigWholesaleByVariation(mode) {
        if (!this.state.isConfigWholesalePrice) return
        let isRemoveWholesalePrice = this.state.isRemoveWholesalePrice
        let isCheckRemoveWholesaleItem = this.state.isCheckRemoveWholesaleItem
        let totalWholeSaleList = this.state.totalWholeSaleList
        let isConfigWholesalePrice = this.state.isConfigWholesalePrice
        let errorValidSellingPrice = this.state.errorValidSellingPrice

        if (mode === VariationEditorMode.ADD_NEW_ROW || mode === VariationEditorMode.REMOVE_ROW) {
            isConfigWholesalePrice = false
            errorValidSellingPrice = ''
            if (this.state.totalWholeSaleList > 0) {
                isRemoveWholesalePrice = true
                totalWholeSaleList = 0
            }

        }
        this.setState({
            isRemoveWholesalePrice: isRemoveWholesalePrice,
            isConfigWholesalePrice: isConfigWholesalePrice,
            totalWholeSaleList: totalWholeSaleList,
            isCheckRemoveWholesaleItem: isCheckRemoveWholesaleItem,
            errorValidSellingPrice: errorValidSellingPrice,
        })
    }

    changeConfigConversionByVariation(mode) {
        if (!this.state.isConfigConversionUnit) return
        // let isRemoveConversionUnit = this.state.isRemoveConversionUnit
        // let isCheckRemoveConversionUnit = this.state.isCheckRemoveConversionUnit
        let isConfigConversionUnit = this.state.isConfigConversionUnit

        if (this.props.mode === ProductFormEditorMode.ADD_NEW || mode === VariationEditorMode.ADD_NEW_ROW || mode === VariationEditorMode.REMOVE_ROW) {
            // isRemoveConversionUnit = true
            isConfigConversionUnit = false
        }
        // else if(mode === VariationEditorMode.CHANGE_ITEM){
        //     isCheckRemoveConversionUnit = true
        // }

        this.setState({
            // isRemoveConversionUnit: isRemoveConversionUnit,
            // isCheckRemoveConversionUnit: isCheckRemoveConversionUnit,
            isConfigConversionUnit: isConfigConversionUnit,

        })

    }

    handleModelWithoutDeposit(models) {
        if (!models.find(model => model.label.includes("[d3p0s1t]"))) return models
        const excludedDeposit = models.filter(model => model.name.includes("[100P3rc3nt]"));
        return excludedDeposit
    }

    getVariationRemove(item) {
        if (!item || this.props.mode !== ProductFormEditorMode.EDIT) return
        if (this.state.isConfigWholesalePrice || this.state.isConfigConversionUnit) {

            if (!this.props.item.models) return
            let listVars = this.handleModelWithoutDeposit(this.props.item.models)
            let dataIds = item.map(r => {
                return r.id
            })
            let listRemove = this.state.variationRemoveList
            listRemove = listRemove.concat(dataIds)
            if (listRemove.length === listVars.length) {
                this.setState({
                    // isRemoveConversionUnit: true,
                    isRemoveWholesalePrice: true,
                    isConfigConversionUnit: false,
                    isConfigWholesalePrice: false
                })
            } else {
                this.setState({
                    variationRemoveList: listRemove,
                    isCheckRemoveWholesaleItem: true,
                    // isCheckRemoveConversionUnit: true
                })
            }
        }
    }

    onFormChange(check) {
        this.setState({
            onChange: true
        })
        if (!check) return
        this.changeConfigWholesaleByVariation(check)
        this.changeConfigConversionByVariation(check)

    }

    onFormChangeImeiModal() {
        this.setState({
            onChangeImeiModal: true,
        })
    }

    fetchWholesalePricing(itemId) {

        this.setState({
            isFetchingWholesale: true
        })
        ItemService.getAllWholesalePrice(itemId)
            .then(result => {
                this.setState({
                    isFetchingWholesale: false
                })
                if (result?.total > 0) {
                    this.setState({
                        isConfigWholesalePrice: true
                    })
                }
                let totalVars = this.listSelectedVariations(result?.lstItemModelIds)
                this.setState({
                    wholesaleList: result?.lstResult,
                    groupItemModelWholesale: result?.lstItemModelIds,
                    totalWholeSaleList: result?.total,
                    totalModelWholesale: totalVars
                })


                // console.log('get list wholesale from productEdit', result)
            })
            .catch((err) => {
                console.log(err)
                this.setState({
                    isFetchingWholesale: false
                })
            })
    }

    fetchConversionUnitList(itemId) {
        this.setState({
            isFetchingConversion: true
        })
        ItemService.getAllTotalConversionUnits(itemId)
            .then(result => {
                let isConfig = this.state.isConfigConversionUnit
                if (result?.total > 0) {
                    isConfig = true
                }

                this.setState({
                    isFetchingConversion: false,
                    conversionUnitList: result,
                    totalConversionUnitItem: result?.total,
                    totalVariationConfigUnitItem: result?.lstModelId,
                    isConfigConversionUnit: isConfig

                })
            })
            .catch((err) => {
                console.log(err)
                this.setState({
                    isFetchingConversion: false
                })
            })
    }

    componentDidMount() {
        if (this.props.mode === ProductFormEditorMode.EDIT) {

            this.fetchWholesalePricing(this.props.itemId)
            this.fetchConversionUnitList(this.props.itemId)
            this.setState({
                prodImageList: this.props.item.images,
                prodImageMain: 0,
                isActive: this.props.item.bhStatus === 'ACTIVE',
                prodPrice: this.props.item[ProductModelKey.ORG_PRICE],
                symbolCode: this.props.item[ProductModelKey.CURRENCY],
                manageInventory: this.props.item.inventoryManageType,
                //itemModelCodeDTOS:this.props.item.itemModelCodeDTOS,
                manageInventoryLstInventory: this.props.item.lstInventory
            }, () => {
                this.isCheckValidOnly = true
                this.onSave()
            })
            this.props.item.saleChannels.forEach(channel => {
                if (channel.name === "LAZADA") this.setState({lazadaStatus: true})
                else if (channel.name === "TIKI") this.setState({tikiStatus: true})
            });
            // check status for shopee, if has linked item -> status = true
            if (this.props.shopeeItemList.length > 0) {
                this.setState({shopeeStatus: true})
            }
        }
        if (this.props.item) {
            const taxIdDefault = this.props.item.taxId
            let defaultVAT
            if (taxIdDefault) {
                defaultVAT = this.props.item.taxSettings.find(vat => vat.id == taxIdDefault)
            } else {
                defaultVAT = this.props.item.taxSettings.find(vat => vat.useDefault)
            }
            if (!defaultVAT) {
                this.setState({
                    listVAT: this.props.item.taxSettings,
                })
            } else {
                this.setState({
                    listVAT: this.props.item.taxSettings,
                    defaultVAT: {
                        label: defaultVAT.name == 'tax.value.include' ? i18next.t('page.setting.VAT.table.defaultValue') : defaultVAT.name,
                        value: defaultVAT.id
                    }
                })
            }
            this.setState({
                inStore: (this.props.item.inStore || false),
                inGosocial: (this.props.item.inGosocial || false),
                onApp: (this.props.item.onApp || false),
                onWeb: (this.props.item.onWeb || false)
            })
        } else {
            storeService.getListVAT()
                .then((result) => {
                    const defaultVAT = result.find(vat => vat.useDefault && vat.taxType === 'SELL')
                    const taxSELL = result.filter(tax => tax.taxType === 'SELL')
                    if (!defaultVAT) {
                        this.setState({
                            listVAT: taxSELL,
                        })
                    } else {
                        this.setState({
                            listVAT: taxSELL,
                            defaultVAT: {
                                label: defaultVAT.name == 'tax.value.include' ? i18next.t('page.setting.VAT.table.defaultValue') : defaultVAT.name,
                                value: defaultVAT.id
                            }
                        })
                    }
                })
                .catch(() => GSToast.commonError())
        }
        storeService.getStoreListingWebsite()
            .then(storeListing => {
                this.setState(state => ({
                    enabledListing: this.props.item ? this.props.item.enabledListing : storeListing.enabledProduct,
                    storeListing: storeListing
                }))
            })
    }

    toggleShopeeSyncTypeModal() {
        this.setState(state => ({isShowShopeeSyncTypeModal: !state.isShowShopeeSyncTypeModal}))
    }

    getDefaultInventories() {
        if (this.props.mode === ProductFormEditorMode.EDIT) {
            return []
        }
        if (!this.props.branchList) {
            return []
        }
        return this.props.branchList.map(branch => ({
            branchId: branch.id,
            inventoryActionType: InventoryEnum.ACTION_TYPES.FROM_CREATE_AT_ITEM_SCREEN,
            inventoryCurrent: 0,
            inventoryStock: 0,
            inventoryType: InventoryEnum.ACTIONS.CHANGE_STOCK,
            sku: ''
        }))
    }

    onCloseUpdateStockModal() {
        this.setState({
            isShowUpdateStock: false
        })
    }

    onCloseUpdateSKUModal() {
        this.setState({
            isShowUpdateSKU: false
        })
    }

    onChangeProdName(e) {
        this.setState({
            prodName: e.currentTarget.value
        })
        this.onFormChange();
    }

    onChangeVariationRow(e) {
        this.setState({
            variationRows: e
        })
        let getVariationRow = e
    }

    checkVariationDataForWholesale(check) {
        // if(!check) return
        // if(!this.state.isConfigWholesalePrice) return
        if (check && this.state.isConfigWholesalePrice) {
            let errorValidSellingPrice = this.state.errorValidSellingPrice

            if (check === 'NONE') {
                this.checkProdDiscountPriceForWholesale(this.state.prodDiscountPrice)
            } else if (check === 'HAS_DATA') {
                if (this.checkSellingPriceForWholesale()) {
                    errorValidSellingPrice = i18next.t('component.wholesalePrice.error.please_input_price_first')
                } else {
                    errorValidSellingPrice = ''
                }
            } else if (check === 'DATA_NULL') {
                errorValidSellingPrice = i18next.t('component.productFormEditor.validate.variation.for.wholesale')
            }
            this.setState({
                errorValidSellingPrice: errorValidSellingPrice,
            })
        }
    }

    changeShowOutOfStock(e) {
        this.setState({
            showOutOfStock: e.currentTarget.value
        });
        this.onFormChange();
    }

    changeIsHideStock(e) {
        this.setState({
            isHideStock: e.currentTarget.value
        })
        this.onFormChange();
    }

    syncToShopeeWithSave() {
        if (this.state.isShopeeSynced) {
            this.setState({directToShopee: true});
        } else {
            this.setState({
                directToShopeeAccountManagement: true
            })
        }
        this.onSave()
    }

    isHasDeposit(itemModel) {
        if (itemModel.hasModel) {
            const firstModel = itemModel.models[0]
            return firstModel.label.includes(Constants.DEPOSIT_CODE.CODE)
        }
        return false;
    }

    syncToShopeeWithoutSave() {
        // check connected
        if (!this.state.isShopeeSynced) {
            this.refConfirmModal.openModal({
                messages: i18next.t`page.product.haveNoShopeeAccountText`,
                modalBtnCancel: i18next.t`common.btn.cancel`,
                modalBtnOk: i18next.t`shopee.account.author.connect`,
                okCallback: () => {
                    return this.setState({
                        onRedirect: true
                    }, () => RouteUtils.redirectWithoutReload(this.props, NAV_PATH.shopeeAccountManagement))
                }
            })
            return
        }
        // check deposit
        if (this.props.mode === ProductFormEditorMode.EDIT) {
            const hasDeposit = this.isHasDeposit(this.props.item)
            if (hasDeposit) {
                this.alertModal.openModal({
                    type: AlertInlineType.ERROR,
                    messages: i18next.t('page.product.create.shopee.doesnotSyncDeposit')
                })
                return
            }
        }
        const isHasLinkedProduct = this.isHasLinkedProduct();
        const isHasNewAccount = this.isHasNewShopeeAccount();
        // If item has linked product AND new shopee account => Show pop to select sync mode before redirect
        if (isHasLinkedProduct && isHasNewAccount) {
            return this.setState({
                isShowShopeeSyncTypeModal: true
            })
        } else {
            // If has linked product only => Redirect to Shopee item edit page
            if (isHasLinkedProduct) {
                return this.setState({
                    onRedirect: true
                }, () => RouteUtils.redirectWithoutReload(this.props, "/channel/shopee/edit_product/" + this.props.item.id));
            }
            // If has new account only => Redirect to Shopee new item page
            if (isHasNewAccount) {
                return this.setState({
                    onRedirect: true
                }, () => RouteUtils.redirectWithoutReload(this.props, "/channel/shopee/product/" + this.props.item.id));
            }
        }
    }

    linkToShopeeChannel() {
        // check token expired
        // account list > 0 but has expired account
        if ((this.state.shopeeAccountList.filter(shopeeAcc => shopeeAcc.connectStatus === 'EXPIRED_CONNECTED').length
            === this.state.shopeeAccountList.length) && this.state.shopeeAccountList.length > 0
        ) {
            // all of shopee account are expired
            this.alertModal.openModal({
                type: AlertModalType.ALERT_TYPE_OK,
                modalTitle: i18next.t('common.txt.alert.modal.title'),
                messages: i18next.t('shopee.alert.reconnect'),
                closeCallback: () => {
                    RouteUtils.redirectWithoutReload(this.props, NavigationPath.shopeeAccountManagement)
                },
                modalBtn: i18next.t('common.btn.alert.modal.ok')
            })

        } else { // => shopee accounts are fine
            if (this.state.onChange && this.props.mode === ProductFormEditorMode.EDIT) { // form has been changed
                // confirm want to save product before sync
                this.refConfirmModalChildren.openModal({
                    okCallback: () => {
                        this.syncToShopeeWithSave()
                    },
                    cancelCallback: () => { // un-save
                        this.syncToShopeeWithoutSave();
                    }
                })
            } else {
                this.syncToShopeeWithoutSave();
            }
        }


    }

    linkToTikiChannel() {
        this.refTikiConfirmModalChildren.openModal({
            okCallback: () => {
                this.setState({directToTiki: true});
                this.refBtnSubmitForm.click();
            },
            cancelCallback: () => {
                RouteUtils.redirectTo("/channel/tiki/product/" + this.props.item.id);
            }
        })
    }

    linkToBeecowChannel() {
        this.setState({
            isShowBeecowCategoryModal: true,
        })
    }

    unSaveModal() {
        this.alertModal.openModal({
            type: AlertInlineType.WARN,
            messages: i18next.t('component.modal.create.new.warning')
        })
    }

    setIconByBhSatus(bhStatus) {
        switch (bhStatus) {
            case "ERROR":
                return "icon-sync-error";
            case "INACTIVE":
                return "unsynced";
            default:
                return undefined;
        }
    }

    renderHeader() {
        const renderTag = () => {
            if (this.props.item.bhStatus.toUpperCase() !== 'ERROR') {
                if (this.state.isActive) {
                    return (
                        <UikTag fill className="toolbar__product-status toolbar__product-status--active">
                            <Trans i18nKey="component.product.edit.toolbar.status.active"/>
                        </UikTag>
                    )
                } else {
                    return (
                        <UikTag fill className="toolbar__product-status toolbar__product-status--inactive">
                            <Trans i18nKey="component.product.edit.toolbar.status.inactive"/>
                        </UikTag>
                    )
                }
            } else {
                return (
                    <UikTag fill className="gs-status-tag gs-status-tag--error" style={{marginRight: '1em'}}>
                        <Trans i18nKey="component.product.edit.toolbar.status.error"/>
                    </UikTag>
                )
            }
        }
        switch (this.props.mode) {
            case ProductFormEditorMode.ADD_NEW:
                return (
                    <GSContentHeader className="page-toolbar">
                        <div>
                            <Link to={NAV_PATH.products} className="color-gray mb-2 d-block">
                                &#8592; <GSTrans t="page.product.create.goBackProductList"/>
                            </Link>

                            <div style={{display: 'flex', alignItems: 'center'}}>
                                <h5 className="gs-page-title">
                                    <Trans i18nKey="component.product.addNew.toolBar.createNewProduct">
                                        Create new product
                                    </Trans>
                                </h5>
                                <HintPopupVideo
                                    category={'CREATE_PRODUCT'}
                                    title={'Create Product'}/>
                            </div>
                        </div>
                        {this.renderHeaderBtnNew()}
                    </GSContentHeader>
                )
            case ProductFormEditorMode.EDIT:
                return (
                    <GSContentHeader className="page-toolbar">
                        <div>
                            <Link to={NAV_PATH.products} className="color-gray mb-2 d-block">
                                &#8592; <GSTrans t="page.product.create.goBackProductList"/>
                            </Link>
                            <div className="d-flex align-items-center">
                                {this.props.mode === ProductFormEditorMode.EDIT &&
                                renderTag()
                                }
                                <h5 className="gs-page-title product-name">
                                    {this.defaultValue(ProductModelKey.NAME, '')}
                                </h5>
                            </div>
                        </div>
                        {this.renderHeaderBtnEdit()}
                    </GSContentHeader>
                )
            default:
                return (
                    <GSContentHeader className="page-toolbar"></GSContentHeader>
                )
        }
    }

    renderHeaderMobile() {
        switch (this.props.mode) {
            case ProductFormEditorMode.ADD_NEW:
                return (
                    this.renderHeaderBtnNew()
                );
            case ProductFormEditorMode.EDIT:
                return (
                    this.renderHeaderBtnEdit()
                );
            default:
                return (
                    <></>
                )
        }
    }

    renderHeaderBtnNew() {
        return (<div className='gss-content-header--action-btn sticky'>
            <div className='gss-content-header--action-btn--group'>
                {/*BTN SAVE*/}
                <GSButton success className="btn-save" marginRight style={{marginLeft: 'auto'}}
                          onClick={this.onSave}
                          data-sherpherd="tour-product-step-create-success">
                                    <span className="spinner-border spinner-border-sm" role="status"
                                          hidden={!this.state.isSaving}>
                                    </span>
                    <Trans i18nKey={this.state.isSaving ? 'common.btn.saving' : 'common.btn.save'} className="sr-only">
                        Save
                    </Trans>
                </GSButton>
                {/*BTN CANCEL*/}
                <GSButton secondary outline marginLeft hidden={this.state.isSaving}
                          onClick={this.handleOnCancel}>
                    <Trans i18nKey="common.btn.cancel">
                        Cancel
                    </Trans>
                </GSButton>
            </div>
        </div>);
    }

    handleTranslateSuccess(updatedItemLanguage, updatedModelsLanguages) {
        let isUpdatedItem = false

        const itemLanguages = this.state.itemLanguages.map(lang => {
            if (lang.language === updatedItemLanguage.language) {
                isUpdatedItem = true

                return updatedItemLanguage
            }

            return lang
        })

        if (!isUpdatedItem) {
            //NEW LANGUAGE
            itemLanguages.push(updatedItemLanguage)
        }

        updatedModelsLanguages.forEach(lang => {
            const model = this.state.itemModels.find(m => m.id === lang.modelId)

            if (!model) {
                console.error("Item model not found", lang.modelId)

                return {}
            }

            const langIndex = model.languages.findIndex(l => l.language === lang.language && l.modelId === lang.modelId)

            if (langIndex < 0) {
                model.languages.push(lang)
            } else {
                model.languages.splice(langIndex, 1, lang)
            }
        })

        this.setState({
            itemLanguages: itemLanguages,
            itemModels: this.state.itemModels,
        })
    }

    onClickPlatform(e) {
        const {name, checked} = e.currentTarget;
        this.setState({
            [name]: checked
        }, () => {
            this.onFormChange();
            //this.onCheckPlatformValid();
        });
    }

    onCheckPlatformValid() {
        const {onApp, onWeb, inStore, inGosocial} = this.state;
        if (!onApp && !onWeb && !inStore && !inGosocial) {
            this.setState({
                isValidPlatform: false
            })
        } else {
            this.setState({
                isValidPlatform: true
            })
        }
    }

    renderHeaderBtnEdit() {
        const renderActivateBtnText = () => {
            if (this.state.isActive) {
                return (
                    <Trans i18nKey="component.product.edit.toolbar.status.deactivate">
                        DEACTIVATE
                    </Trans>
                )
            } else {
                return (
                    <Trans i18nKey="component.product.edit.toolbar.status.activate">
                        ACTIVATE
                    </Trans>
                )
            }
        }

        return (
            <div className='gss-content-header--action-btn sticky'>
                <div className='gss-content-header--action-btn--group'>
                    {/*BTN EDIT TRANSLATE*/}

                    <ProductTranslateModal
                        dataLanguages={this.state.itemLanguages}
                        dataModels={this.state.itemModels}
                        onSuccess={this.handleTranslateSuccess}
                        disabledVariation={this.disabledUpdateVariation}
                    />
                    {/*BTN SAVE*/}
                    <GSButton success className="btn-save" style={{marginLeft: 'auto'}}
                              onClick={this.onSave}>
                                    <span className="spinner-border spinner-border-sm" role="status"
                                          hidden={!this.state.isSaving}>
                                    </span>
                        <Trans i18nKey={this.state.isSaving ? 'common.btn.saving' : 'common.btn.save'}
                               className="sr-only">
                            Save
                        </Trans>
                    </GSButton>
                    {/*BTN CANCEL*/}
                    <GSButton secondary outline marginLeft hidden={this.state.isSaving}
                              onClick={this.handleOnCancel}>
                        <Trans i18nKey="common.btn.cancel">
                            Cancel
                        </Trans>
                    </GSButton>
                    {/*BTN DEACTIVATE*/}
                    <GSButton warning outline marginLeft hidden={this.state.isSaving} className={'btn-none-pdlr'}
                              disabled={this.props.item.bhStatus.toUpperCase() === 'ERROR'}
                              onClick={this.onToggleActive}>
                        {renderActivateBtnText()}
                    </GSButton>
                    {/*BTN DELETE*/}
                    <GSButton danger outline marginLeft hidden={this.state.isSaving}
                              onClick={this.onClickRemove}>
                        <Trans i18nKey="common.btn.delete">
                            DELETE
                        </Trans>
                    </GSButton>
                </div>
            </div>
        )
    }

    renderSaleChannels() {
        switch (this.props.mode) {
            case ProductFormEditorMode.ADD_NEW:
                return (
                    <div className="sale-channels-list-wrapper">
                        {/*Store Front*/}
                        <PrivateComponent hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.FEATURE_0103]}>
                            <GSComponentTooltip html={<GSTrans t="component.navigation.storefront"/>}
                                                placement={GSComponentTooltipPlacement.TOP}>
                                <div className="channels-wrapper">
                                    <div className="check-box-wrapper store-front disconnected"
                                         onClick={() => this.unSaveModal()}>
                                        <input type="checkbox" id="cb-store-front" checked/>
                                        <label htmlFor="cb-store-front" className="unsynced"/>
                                    </div>
                                </div>
                            </GSComponentTooltip>
                        </PrivateComponent>
                        {/*BeeCow*/}
                        { CredentialUtils.checkStoreVND() && (
                            <GSComponentTooltip message={"GoMua"} placement={GSComponentTooltipPlacement.TOP}>
                                <div className="channels-wrapper" onClick={() => this.unSaveModal()}>
                                    <div className="check-box-wrapper beecow disconnected">
                                        <input type="checkbox" id="cb-beecow" checked/>
                                        <label htmlFor="cb-beecow" className="unsynced"/>
                                    </div>
                                </div>
                            </GSComponentTooltip>
                        ) }
                        {/** Shopee */}
                        {
                            this.state.isShopeeSynced ?
                                <GSComponentTooltip html={<GSTrans t="tooltips.channels.shopee.activated"/>}
                                                    placement={GSComponentTooltipPlacement.TOP}>
                                    <div className="channels-wrapper" onClick={() => this.unSaveModal()}>
                                        <div className="check-box-wrapper shopee disconnected">
                                            <input type="checkbox" id="cb-shopee" checked/>
                                            <label htmlFor="cb-shopee" className="unsynced"/>
                                        </div>
                                    </div>
                                </GSComponentTooltip>
                                :
                                <GSComponentTooltip html={<GSTrans t="tooltips.channels.shopee.active"/>}
                                                    placement={GSComponentTooltipPlacement.TOP}>
                                    <div className="channels-wrapper"
                                         onClick={() => RouteUtils.redirectWithoutReload(NAV_PATH.shopeeAccount)}>
                                        <div className="check-box-wrapper shopee disconnected">
                                            <label htmlFor="cb-shopee" className="icon-chain"/>
                                        </div>
                                    </div>
                                </GSComponentTooltip>
                        }
                        {/** Tiki */}
                        {/*{*/}
                        {/*    this.state.isTikiSynced ?*/}
                        {/*        <GSComponentTooltip html={<GSTrans t="tooltips.channels.tiki.activated"/>} placement={GSComponentTooltipPlacement.TOP}>*/}
                        {/*            <div className="channels-wrapper" onClick={() => this.unSaveModal()}>*/}
                        {/*                <div className="check-box-wrapper tiki disconnected">*/}
                        {/*                    <input type="checkbox" id="cb-tiki" checked />*/}
                        {/*                    <label htmlFor="cb-tiki" className="unsynced"/>*/}
                        {/*                </div>*/}
                        {/*            </div>*/}
                        {/*        </GSComponentTooltip>*/}
                        {/*        :*/}
                        {/*        <GSComponentTooltip html={<GSTrans t="tooltips.channels.tiki.active"/>} placement={GSComponentTooltipPlacement.TOP}>*/}
                        {/*            <div className="channels-wrapper" onClick={() => RouteUtils.redirectTo('/channel/tiki/account')}>*/}
                        {/*                <div className="check-box-wrapper tiki disconnected">*/}
                        {/*                    <label htmlFor="cb-tiki" className="icon-chain"/>*/}
                        {/*                </div>*/}
                        {/*            </div>*/}
                        {/*        </GSComponentTooltip>*/}
                        {/*}*/}
                    </div>);
            case ProductFormEditorMode.EDIT:
                let isHover = false;
                return (
                    <div className="sale-channels-list-wrapper">
                        {/*Store Front */}
                        <PrivateComponent hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.FEATURE_0103]}>
                            <GSComponentTooltip html={<GSTrans t="component.navigation.storefront"/>}
                                                placement={GSComponentTooltipPlacement.TOP}>
                                <div className="channels-wrapper">
                                    <div className="check-box-wrapper store-front connected">
                                        <input type="checkbox" id="cb-store-front" checked/>
                                        <label htmlFor="cb-store-front"
                                               className={this.setIconByBhSatus(this.props.item.bhStatus)}/>
                                    </div>
                                </div>
                            </GSComponentTooltip>
                        </PrivateComponent>
                        {/*BeeCow*/}
                        { CredentialUtils.checkStoreVND() && (
                            <GSComponentTooltip message={"GoMua"} placement={GSComponentTooltipPlacement.TOP}>
                                <div className="channels-wrapper" onClick={() => this.linkToBeecowChannel()}>
                                    <div className="check-box-wrapper beecow connected">
                                        <input type="checkbox" id="cb-beecow" checked/>
                                        <label htmlFor="cb-beecow"/>
                                    </div>
                                </div>
                            </GSComponentTooltip>
                        )}
                        {/** Shopee */}
                        {
                            this.state.isShopeeSynced ?
                                MANAGE_INVENTORY[1].value === this.state.manageInventory ?
                                    <GSComponentTooltip
                                        html={<GSTrans t="page.product.detail.sold.saleChannels.not.allow.sync"/>}
                                        placement={GSComponentTooltipPlacement.TOP}>
                                        <div className="channels-wrapper">
                                            <div className="check-box-wrapper shopee connected">
                                                <input type="checkbox" id="cb-shopee" checked/>
                                                <label htmlFor="cb-shopee"
                                                       className={!this.state.shopeeStatus ? 'unsynced' : (this.props.item.saleChannels === 'ERROR'
                                                           && this.state.shopeeStatus.status === 'NOT_SELL') ? 'icon-sync-error' : undefined}>
                                                </label>
                                            </div>
                                        </div>
                                    </GSComponentTooltip>
                                    :
                                    <GSComponentTooltip html={<GSTrans t="tooltips.channels.shopee.activated"/>}
                                                        placement={GSComponentTooltipPlacement.TOP}>
                                        <div className="channels-wrapper" onClick={() => {
                                            this.linkToShopeeChannel()
                                        }}>
                                            <div className="check-box-wrapper shopee connected">
                                                <input type="checkbox" id="cb-shopee" checked/>
                                                <label htmlFor="cb-shopee"
                                                       className={!this.state.shopeeStatus ? 'unsynced' : (this.props.item.saleChannels === 'ERROR'
                                                           && this.state.shopeeStatus.status === 'NOT_SELL') ? 'icon-sync-error' : undefined}>
                                                </label>
                                            </div>
                                        </div>
                                    </GSComponentTooltip>
                                :
                                MANAGE_INVENTORY[1].value === this.state.manageInventory ?
                                    <GSComponentTooltip
                                        html={<GSTrans t="page.product.detail.sold.saleChannels.not.allow.sync"/>}
                                        placement={GSComponentTooltipPlacement.TOP}>
                                        <div className="channels-wrapper">
                                            <div className="check-box-wrapper shopee disconnected">
                                                <label htmlFor="cb-shopee" className="icon-chain"/>
                                            </div>
                                        </div>
                                    </GSComponentTooltip>
                                    :
                                    <GSComponentTooltip html={<GSTrans t="tooltips.channels.shopee.active"/>}
                                                        placement={GSComponentTooltipPlacement.TOP}>
                                        <div className="channels-wrapper"
                                             onClick={this.linkToShopeeChannel}>
                                            <div className="check-box-wrapper shopee disconnected">
                                                <label htmlFor="cb-shopee" className="icon-chain"/>
                                            </div>
                                        </div>
                                    </GSComponentTooltip>
                        }
                        {/** Tiki */}
                        {/*{*/}
                        {/*    this.state.isTikiSynced ?*/}
                        {/*        <GSComponentTooltip html={<GSTrans t="tooltips.channels.tiki.activated"/>} placement={GSComponentTooltipPlacement.TOP}>*/}
                        {/*            <div className="channels-wrapper" onClick={() => { this.linkToTikiChannel() }}>*/}
                        {/*                <div className="check-box-wrapper tiki connected">*/}
                        {/*                    <input type="checkbox" id="cb-tiki" checked />*/}
                        {/*                    <label htmlFor="cb-tiki"*/}
                        {/*                           className={!this.state.tikiStatus ? 'unsynced' : (this.props.item.saleChannels === 'ERROR'*/}
                        {/*                               && this.state.tikiStatus.status === 'NOT_SELL') ? 'icon-sync-error' : undefined}>*/}
                        {/*                    </label>*/}
                        {/*                </div>*/}
                        {/*            </div>*/}
                        {/*        </GSComponentTooltip>*/}
                        {/*        :*/}
                        {/*        <GSComponentTooltip html={<GSTrans t="tooltips.channels.tiki.active"/>}  placement={GSComponentTooltipPlacement.TOP}>*/}
                        {/*            <div className="channels-wrapper" onClick={() => RouteUtils.redirectTo('/channel/tiki/account')}>*/}
                        {/*                <div className="check-box-wrapper tiki disconnected">*/}
                        {/*                    <label htmlFor="cb-tiki" className="icon-chain"/>*/}
                        {/*                </div>*/}
                        {/*            </div>*/}
                        {/*        </GSComponentTooltip>*/}
                        {/*}*/}
                    </div>);
        }
    }

    isHasLinkedProduct() {
        return this.props.shopeeItemList.length > 0
    }

    isHasNewShopeeAccount() {
        if (this.props.mode === ProductFormEditorMode.ADD_NEW) return true;
        for (const shopeeAccount of this.state.shopeeAccountList) {
            const {shopId} = shopeeAccount
            // check if has no item belong this shopee account -> new account
            if (this.props.shopeeItemList.filter(spItem => spItem.shopeeShopId === shopId).length === 0) {
                return true
            }
        }
        return false;
    }

    isShopeeSync() {
        shopeeService.getAllConnectShops()
            .then(response => {
                if (response.length > 0) {
                    this.setState({
                        isShopeeSynced: response.filter(shopeeAcc => shopeeAcc.connectStatus === 'CONNECTED' || shopeeAcc.connectStatus === 'EXPIRED_CONNECTED').length > 0,
                        shopeeAccountList: response
                    });
                }
            })
            .catch(e => {
                if (e.response.status !== Constants.HTTP_STATUS_NOT_FOUND)
                    this.setState({isShopeeSynced: false});
            })
    }

    isLazadaSync() {
        lazadaService.getAccountByBcStoreId(storageService.get(Constants.STORAGE_KEY_STORE_ID))
            .then(response => {
                if (response.sellerId)
                    this.setState({isLazadaSynced: true});
            })
            .catch(e => {
                if (e.response.status !== Constants.HTTP_STATUS_NOT_FOUND)
                    this.setState({isLazadaSynced: false});
            })
    }

    isTikiSync() {
        tikiService.getShopAccounts()
            .then(response => {
                this.setState({isTikiSynced: true});
            })
            .catch(e => {
                if (e.response.status !== Constants.HTTP_STATUS_NOT_FOUND)
                    this.setState({isTikiSynced: false});
            })
    }

    onOkLinkToBeecow(cateId, categories) {
        this.setState({
            linkToBeecowCateId: cateId,
            isShowBeecowCategoryModal: false,
            linkToBeecowCategories: categories
        }, () => {
            this.onSave()
        })
    }

    getDataForUpdateStock() {
        let lstInventory = []
        if (this.state.varLength === 0 && this.state.depositLength === 0 && this.props.mode === ProductFormEditorMode.EDIT) { // has been update stock
            const firstRow = this.state.stockDataRow[0]
            if (firstRow) {
                lstInventory = firstRow.lstInventory
            } else {
                lstInventory = this.props.item.lstInventory
                if (!lstInventory || lstInventory.length === 0) {
                    lstInventory = ItemUtils.mapBranchesToLstInventory(this.props.branchList)
                }
            }
            lstInventory.forEach(branch => {
                branch.newStock = branch.stock
            })
            return [{
                id: this.defaultValue('id', null),
                name: this.state.prodName,
                lstInventory: lstInventory
            }]
        }
        if (this.state.varLength === 0 && this.state.depositLength === 0 && this.props.mode === ProductFormEditorMode.ADD_NEW) {
            const firstRow = this.state.stockDataRow[0]
            if (firstRow) {
                lstInventory = firstRow.lstInventory
            } else {
                lstInventory = ItemUtils.mapBranchesToLstInventory(this.props.branchList)
            }
            lstInventory.forEach(branch => {
                branch.newStock = branch.stock
            })
            return [{
                id: this.defaultValue('id', null),
                name: this.state.prodName,
                lstInventory: lstInventory
            }]
        }
        return []
    }

    /**
     * @return {ItemModel}
     */
    getModelForMultipleBranchUpdate() {
        /**
         * @type {ItemModel}
         */
        let item = {}
        if (this.props.mode === ProductFormEditorMode.ADD_NEW) {
            item.name = this.state.prodName
        } else {
            item = this.props.item
        }
        return item;
    }

    onSaveSKU(dataRows) {
        this.onSaveStock(0, InventoryEnum.ACTIONS.CHANGE_STOCK, dataRows)
        this.setState({
            isShowUpdateSKU: false
        })
        this.onFormChange();
    }

    /**
     * Handle save event from modal
     * @param {number} value
     * @param {"CHANGE"|"SET"}mode
     * @param {UpdateStockDataRowModel[]} dataRows
     */
    onSaveStock(value, mode, dataRows) {
        const fRow = dataRows[0]
        if (fRow) {
            fRow.lstInventory.forEach(ivt => {
                ivt.stock = ivt.newStock
            })
        }
        this.setState({
            // isSaving: true,
            isShowUpdateStock: false,
            onSaveStock: true,
            stockDataRow: dataRows,
            stockUpdateMode: mode,
            lstInventory: fRow.lstInventory.map(inv => ({
                branchId: inv.branchId,
                inventoryActionType: InventoryEnum.ACTION_TYPES.FROM_CREATE_AT_ITEM_SCREEN,
                inventoryStock: inv.stock,
                inventoryType: mode,
                sku: inv.sku
            }))
        })
        this.onFormChange();
    }

    calculateRemainingStock() {
        if (this.props.mode === ProductFormEditorMode.EDIT) {
            if (this.state.varLength + this.state.depositLength === 0 && this.props.item.hasModel && !this.state.stockDataRow[0]) { // has model but update new variation to empty -> remaining prod is 0
                return 0
            }
            if (this.state.varLength + this.state.depositLength > 0) {
                // const varList = this.refProdVariation.current.getValue()
                // const depositList = this.refProdDeposit.current.getValue()
                // // console.log(varList, depositList)
                // const sumRemaining = [...varList, ...depositList].map(v => v.newStock).reduce( (a, sum) => a + sum)
                if (this.state.stockDataRow[0]) {
                    return this.state.stockDataRow[0].newStock
                } else {
                    return this.props.item.remaining
                }
            }
            if (this.state.stockDataRow[0]) {
                return this.state.stockDataRow[0].newStock
            }
            if (this.state.varLength + this.state.depositLength === 0 && !this.props.item.hasModel) {
                return this.props.item.remaining
            }
        }
    }

    calculateRemainingStockByBranch() {
        const {mode, item, branchList} = this.props
        if (mode === ProductFormEditorMode.EDIT) {
            if (item.hasModel) {
                const modelReducer = (acc, model) => {
                    const invReducer = (acc, inv) => acc + inv.orgStock
                    return acc + model.lstInventory.reduce(invReducer, 0)
                }
                const remainingStock = item.models.reduce(modelReducer, 0)
                return remainingStock
            }
            const reducer = (acc, inv) => {
                let branch = this.state.lstInventory.find(currentInv => currentInv.branchId === inv.branchId)
                if (!branch) {
                    return acc + inv.orgStock
                }
                return acc + branch.inventoryStock
            }
            const lstInventoryWithActiveBranch = item.lstInventory.filter(inv => branchList.findIndex(branch => branch.id === inv.branchId) > -1)
            const remainingStock = lstInventoryWithActiveBranch.reduce(reducer, 0)
            return remainingStock
        }
    }

    calculateSoldCountByBranch() {
        const {mode, item} = this.props
        if (mode === ProductFormEditorMode.EDIT) {
            if (item.hasModel) {
                const modelReducer = (acc, model) => {
                    const invReducer = (acc, inv) => acc + inv.soldStock
                    return acc + model.lstInventory.reduce(invReducer, 0)
                }
                const soldCountStock = item.models.reduce(modelReducer, 0)
                return soldCountStock
            }
            const reducer = (acc, inv) => acc + inv.soldStock
            const soldCountStock = item.lstInventory.reduce(reducer, 0)
            return soldCountStock
        }
    }

    handleApplyAllBranches(e) {
        e.preventDefault()
        if (!this.refProdStock.current.isValid()) {
            return
        }
        const stock = this.refProdStock.current.getValue()
        this.setState(state => ({
            lstInventory: state.lstInventory.map(inv => ({
                ...inv,
                inventoryStock: stock,
            }))
        }))
    }

    getDefaultBranchStock(branchId) {
        let branch = this.state.lstInventory.find(inv => inv.branchId === branchId)
        if (branch) {
            return branch.inventoryStock
        }
        if (!this.props.item) {
            return 0
        }
        branch = this.props.item.lstInventory.find(inv => inv.branchId === branchId)
        if (!branch) {
            return 0
        }
        return branch.orgStock
    }

    handleChangeBranchStock(branchId, value) {
        this.setState(state => ({
            lstInventory: state.lstInventory.map(inv => {
                if (inv.branchId !== branchId) {
                    return inv
                }
                return {
                    ...inv,
                    inventoryStock: value,
                }
            })
        }))
        this.onFormChange();
    }

    getDataForUpdateStockManagedInventory(managedInventoryList, getAllItemModelCode) {
        let dataItemModelCodeList = []
        let cloneLstInventory = this.props.mode === ProductFormEditorMode.EDIT && this.state.manageInventoryLstInventory.length > 0
            ? this.state.manageInventoryLstInventory :
            this.props.branchList.map(branch => ({
                branchId: branch.id,
                inventoryActionType: InventoryEnum.ACTION_TYPES.FROM_CREATE_AT_ITEM_SCREEN,
                inventoryCurrent: 0,
                inventoryStock: 0,
                inventoryType: InventoryEnum.ACTIONS.CHANGE_STOCK,
                stock: 0,
                orgStock: 0,
                sku: "",
                soldStock: 0,
                newStock: 0,
                orgSku: ""
            }))


        managedInventoryList.forEach(managedInventory => {

            if (this.props.mode === ProductFormEditorMode.ADD_NEW) {
                this.handleChangeBranchStock(managedInventory.branchId, managedInventory.serial.length)
                managedInventory.serial.forEach(code => {
                    dataItemModelCodeList.push({
                        branchId: managedInventory.branchId,
                        code: code,
                        status: Constants.ITEM_MODE_CODE_STATUS.AVAILABLE
                    })
                })
            }
            if (this.props.mode === ProductFormEditorMode.EDIT) {
                const index = cloneLstInventory.findIndex(id => id.branchId === managedInventory.branchId)
                cloneLstInventory[index].newStock = managedInventory.serial.length
                const data = {
                    lstInventory: cloneLstInventory
                }
                const dataTable = [_.cloneDeep(data)]
                this.onSaveStock(0, "SET", dataTable)

                if (this.state.manageInventoryLstInventory.length > 0) {
                    managedInventory.serial.forEach(code => {
                        let findCode = this.state.itemModelCodeDTOS.length > 0
                            ? this.state.itemModelCodeDTOS.find(findCode => findCode.code === code) :
                            getAllItemModelCode.find(findCode => findCode.code === code)
                        dataItemModelCodeList.push({
                            id: findCode?.id,
                            itemId: findCode?.itemId,
                            branchId: managedInventory.branchId,
                            code: code,
                            status: Constants.ITEM_MODE_CODE_STATUS.AVAILABLE
                        })
                    })
                } else {
                    managedInventory.serial.forEach(code => {
                        dataItemModelCodeList.push({
                            branchId: managedInventory.branchId,
                            code: code,
                            status: Constants.ITEM_MODE_CODE_STATUS.AVAILABLE
                        })
                    })
                }


            }
        })
        this.setState({
            itemModelCodeDTOS: dataItemModelCodeList,
            onChangeImeiModal: true
        })
        return []
    }

    handleSelectedVAT = (event) => {
        let valueSelect = event.value
        this.setState({
            defaultVAT: event
        })
        this.onFormChange();
    }

    onChangeShopeeSyncType(type) {
        this.setState({
            shopeeSyncType: type
        })
    }

    onShopeeSyncModeConfirm() {
        switch (this.state.shopeeSyncType) {
            case SHOPEE_SYNC_TYPE.CREATE_NEW:
                return this.setState({
                    onRedirect: true
                }, () => RouteUtils.redirectWithoutReload(this.props, "/channel/shopee/product/" + this.props.item.id));
            case SHOPEE_SYNC_TYPE.UPDATE:
                return this.setState({
                    onRedirect: true
                }, () => RouteUtils.redirectWithoutReload(this.props, "/channel/shopee/edit_product/" + this.props.item.id));
        }
    }

    handleCancelResync() {
        // cancel:
        this.redirectToProduct(this.props.item.id);
    }

    handleOkResync() {
        // show error if item has deposit
        const hasDeposit = this.isHasDeposit(this.state.afterSavedItem)
        if (hasDeposit) {
            this.alertModal.openModal({
                type: AlertInlineType.ERROR,
                messages: i18next.t('page.product.create.shopee.doesnotSyncDeposit')
            })
            GSToast.commonUpdate()
            return;
        }
        // ok:
        this.redirectToProduct(this.props.item.id);
        this.setState({
            onRedirect: true
        }, () => RouteUtils.redirectWithoutReload(this.props, "/channel/shopee/edit_product/" + this.props.item.id));
    }

    handleCheckEnabledListing(e) {
        this.onFormChange()
        this.setState({
            enabledListing: e.currentTarget.value
        })
    }

    checkSellingPriceForWholesale() {
        const variationModel = this.refProdVariation.current.getValue()
        let check = variationModel.some(item => (item.newPrice === 0))
        return variationModel.some(item => (item.newPrice === 0))
    }

    handleChangeUnit(unit) {
        this.setState({
            unitId: unit == null ? null : unit.id,
            unitName: unit == null ? null : unit.name
        })
    }

    handleCheckEnabledWholeSalePrice(checked) {
        let errorValidSellingPrice = ''
        let isConfig = this.state.isConfigWholesalePrice
        if (checked) {
            isConfig = true
            const variationList = this.refProdVariation.current.getValue()
            if (this.state.variationRows.length > 0) {
                if (variationList.length < 1) {
                    errorValidSellingPrice = i18next.t('component.productFormEditor.validate.variation.for.wholesale')
                } else {
                    if (this.checkSellingPriceForWholesale()) {
                        errorValidSellingPrice = i18next.t('component.product.addNew.whoSalePrice.errorCheckPriceProduct')
                    }
                }
            } else {
                if (this.state.prodDiscountPrice === 0) {
                    errorValidSellingPrice = i18next.t('component.wholesalePrice.error.please_input_price_first')
                }
            }

            this.setState({
                isConfigWholesalePrice: isConfig,
                errorValidSellingPrice: errorValidSellingPrice,
            })

        } else {
            if (this.state.totalWholeSaleList > 0) {
                this.refConfirmModal.openModal({
                    messages: i18next.t('component.product.addNew.cancelHint'),
                    okCallback: () => {
                        this.setState(state => ({
                            isConfigWholesalePrice: !state.isConfigWholesalePrice,
                            totalWholeSaleList: 0,
                            isRemoveWholesalePrice: true,
                        }))
                    }
                })
            } else {
                this.setState(state => ({
                    isConfigWholesalePrice: !state.isConfigWholesalePrice,
                    errorValidSellingPrice: errorValidSellingPrice
                }))
            }
        }
    }

    renderCommissionAlert() {
        const rateArray = this.props.commissionList.map(commission => commission.rate)
        const maxRate = Math.max(...rateArray)
        const isAllEqual = rateArray.every(rate => rate == rateArray[0])

        let alertMsg;
        // CASE: ALL commissions have the same rate
        if (isAllEqual && maxRate != 0) {
            alertMsg = (
                <GSTrans t="page.product.detail.commission.productCommissionExactRate" values={{
                    rate: maxRate
                }}>
                    You will earn commission <strong className="color-red">rate</strong> by selling this product.
                </GSTrans>
            )
        }
        // CASE: ALL commissions have NO the same rate
        if (!isAllEqual && maxRate != 0) {
            alertMsg = (
                <GSTrans t="page.product.detail.commission.productCommissionUpToRate" values={{
                    rate: maxRate
                }}>
                    You will earn commission up to <strong className="color-red">rate</strong> by selling this product.
                </GSTrans>
            )
        }

        // CASE: maxRate is ZERO
        if (maxRate == 0) {
            alertMsg = (
                <GSTrans t="page.product.detail.commission.productCommissionNotRate">
                    Commission rate: <strong className="color-red">0%</strong>. You will <strong>NOT</strong> earn
                    commission by selling this product.
                </GSTrans>
            )
        }


        return (
            <GSAlertBox iconSrc="/assets/images/commission-alert.svg" className="mt-3">
                <GSTrans t="page.product.detail.commission.productBelongStore" values={{
                    storeName: CredentialUtils.ROLE.RESELLER.getFromStoreName()
                }}>
                    This product is supplied by <strong>storeName</strong>.
                </GSTrans>
                <div className="mt-2 mb-2 mt-md-1 mb-md-1">
                    {alertMsg}
                </div>
                <GSTrans t="page.product.detail.commission.notice.notAllowEditCommission">
                    <strong>Notice:</strong> <em>Not allow to update variation of product has commission.</em>
                </GSTrans>
            </GSAlertBox>
        )
    }

    handleChangeManageInventory(e) {
        this.setState({
            manageInventory: e.target.value
        })


    }

    handleOpenManagedInventoryModal(branchId) {
        let branchIdList = []
        if (branchId.length > 1) {
            branchId.map(bId => branchIdList.push(bId.id))
        }
        this.setState({
            isOpenManagedInventoryModal: true,
            branchIds: branchId.length > 1 ? branchIdList : typeof branchId[0] === 'object' ?
                branchId.map(bId => bId.id) : branchId
        })
    }

    handleManagedInventoryCallback() {
        this.setState({
            isOpenManagedInventoryModal: false
        })
    }

    configWholesalePricing() {
        this.renderPageMode = renderNewPageMode.WHOLESALE_PAGE
    }

    listSelectedVariations(lstItemModelIds) {
        let count = 0
        for (const item of lstItemModelIds) {
            let plusSymbol = item.indexOf(',')
            if (plusSymbol > 0) {
                let list = item.split(',')
                count += list.length
            } else {
                if (item == this.itemId) {
                    count = 0
                } else {
                    count += 1
                }
            }
        }
        return count
    }

    handleCheckConversionUnit(check) {
        if (check) {
            this.setState((state) => ({
                isConfigConversionUnit: !state.isConfigConversionUnit,
            }));
        } else {
            this.setState((state) => ({
                isConfigConversionUnit: !state.isConfigConversionUnit,
                isRemoveConversionUnit: true
            }));
        }
    }

    configUnitConversion() {
        this.renderPageMode = renderNewPageMode.CONVERSION_UNIT_PAGE
    }
    

    render() {
        return (
            <GSContentContainer confirmWhenRedirect confirmWhen={!this.state.onRedirect && this.state.onChange}
                                className="product-form-page"
                                minWidthFitContent
                                isSaving={this.state.isSaving}>
                <ManagedInventoryModal
                    isOpenModal={this.state.isOpenManagedInventoryModal}
                    callback={this.handleManagedInventoryCallback}
                    branchList={this.props.branchList}
                    dataTable={this.getDataForUpdateStockManagedInventory}
                    editItemModelCodeDTOS={this.state.itemModelCodeDTOS}
                    mode={this.props.mode}
                    modeVariation={false}
                    prodName={this.state.prodName}
                    branchId={this.state.branchIds}
                />
                {/*save modal*/}
                <Modal
                    isOpen={this.state.isModalSave}
                    className="isModalSave"
                >
                    <ModalHeader>{i18next.t('common.txt.alert.modal.title')}</ModalHeader>
                    <ModalBody>
                        <p className="mb-2">{i18next.t('page.products.detail.modal.description')}</p>
                        <p className="mb-2 font-weight-light">{i18next.t('page.products.detail.modal.description2')}</p>
                        <p className="mb-0">{i18next.t('page.products.detail.modal.description3')}</p>
                    </ModalBody>
                    <ModalFooter>
                        <GSButton onClick={() => {
                            this.handleCancelResync()
                        }} default>
                            <GSTrans t={"common.btn.cancel"}/>
                        </GSButton>
                        <GSButton onClick={() => {
                            this.handleOkResync()
                        }} marginLeft success>
                            <GSTrans t={"page.shopeeProduct.management.filter.status.RESYNC"}/>
                        </GSButton>
                    </ModalFooter>
                </Modal>
                {/*Shopee sync type*/}
                <Modal isOpen={this.state.isShowShopeeSyncTypeModal}>
                    <ModalHeader>
                        <GSTrans t={"common.txt.confirm.modal.title"}/>
                    </ModalHeader>
                    <ModalBody>
                        <UikFormInputGroup className="d-flex flex-column align-items-start">
                            <UikRadio
                                label={i18next.t`page.product.create.shopeeSync.createNewToShopee`}
                                name="m-segment"
                                checked={this.state.shopeeSyncType === SHOPEE_SYNC_TYPE.CREATE_NEW}
                                onClick={() => this.onChangeShopeeSyncType(SHOPEE_SYNC_TYPE.CREATE_NEW)}
                            />
                            <UikRadio
                                label={i18next.t`page.product.create.shopeeSync.syncToShopee`}
                                name="m-segment"
                                checked={this.state.shopeeSyncType === SHOPEE_SYNC_TYPE.UPDATE}
                                onClick={() => this.onChangeShopeeSyncType(SHOPEE_SYNC_TYPE.UPDATE)}
                            />
                        </UikFormInputGroup>
                    </ModalBody>
                    <ModalFooter>
                        <GSButton default onClick={this.toggleShopeeSyncTypeModal}>
                            <GSTrans t={"common.btn.cancel"}/>
                        </GSButton>
                        <GSButton success marginLeft onClick={this.onShopeeSyncModeConfirm}>
                            <GSTrans t={"welcome.forgotPassword.btn.continue"}/>
                        </GSButton>
                    </ModalFooter>
                </Modal>
                {this.props.mode === ProductFormEditorMode.EDIT &&
                <ProductMultipleBranchStockEditorModal isOpen={this.state.isShowUpdateStock}
                                                       key={this.state.isShowUpdateStock}
                                                       mode={this.props.mode}
                                                       variationLength={this.state.varLength + this.state.depositLength}
                                                       item={this.getModelForMultipleBranchUpdate()}
                                                       branchList={this.props.branchList}
                                                       onCancel={this.onCloseUpdateStockModal}
                                                       selected={this.state.selectedBranches}
                                                       prodName={this.state.prodName}
                                                       dataTable={this.getDataForUpdateStock()}
                                                       onSave={this.onSaveStock}
                />}
                {this.state.varLength + this.state.depositLength === 0 && this.props.mode === ProductFormEditorMode.EDIT &&
                <ProductMultipleBranchSKUEditorModal isOpen={this.state.isShowUpdateSKU}
                                                     key={this.state.isShowUpdateSKU}
                                                     mode={this.props.mode}
                                                     variationLength={this.state.varLength + this.state.depositLength}
                                                     item={this.getModelForMultipleBranchUpdate()}
                                                     branchList={this.props.branchList}
                                                     onCancel={this.onCloseUpdateSKUModal}
                                                     selected={this.state.selectedBranches}
                                                     prodName={this.state.prodName}
                                                     dataTable={this.getDataForUpdateStock()}
                                                     onSave={this.onSaveSKU}
                />
                }
                {this.renderRedirect()}
                {this.renderHeader()}
                <ProductFormEditorBeecowCategoryModal isOpen={this.state.isShowBeecowCategoryModal}
                                                      okCallback={(cateId, categories) => this.onOkLinkToBeecow(cateId, categories)}
                                                      cancelCallback={() => this.setState({isShowBeecowCategoryModal: false})}
                                                      defaultCateId={this.props.item && this.props.item.cateId}
                />
                <GSContentBody size={GSContentBody.size.MAX}>
                    {this.renderHeaderMobile()}
                    <AvForm onSubmit={this.handleOnSaveSubmit} autoComplete="off">
                        <button ref={(el) => this.refBtnSubmitForm = el} hidden/>
                        {!this.state.isValid &&
                        <div className="alert alert-danger product-form__alert product-form__alert--error" role="alert">
                            <Trans i18nKey="component.product.edit.invalidate"/>
                        </div>
                        }
                        {this.isReSellerCommission && this.renderCommissionAlert()}
                        <section className="product-form-page__widget-wrapper">
                            <section className="product-form-page__widget-col product-form-page__widget-col--n1">
                                {/*PRODUCT INFO*/}
                                <GSWidget className={"gs-widget "}>
                                    <GSWidgetHeader>
                                        <Trans i18nKey="component.product.addNew.productInformation.title">
                                            Product information
                                        </Trans>
                                    </GSWidgetHeader>
                                    <GSWidgetContent>
                                        <Label for={'productName'} className="gs-frm-control__title">
                                            <Trans i18nKey="component.product.addNew.productInformation.name">
                                                Product name
                                            </Trans>
                                        </Label>
                                        <AvFieldCountable
                                            name={'productName'}
                                            type={'text'}
                                            isRequired={true}
                                            minLength={0}
                                            maxLength={100}
                                            value={this.defaultValue(ProductModelKey.NAME, '')}
                                            tabIndex={1}
                                            onChange={this.onChangeProdName}
                                            data-sherpherd="tour-product-step-4"
                                        />
                                        <Label for={'productDescription'} className="gs-frm-control__title">
                                            <Trans i18nKey="component.product.addNew.productInformation.description">
                                                Description
                                            </Trans>
                                        </Label>
                                        <GSEditor
                                            name={'productDescription'}
                                            isRequired={false}
                                            maxLength={100000}
                                            value={this.defaultValue(ProductModelKey.DESCRIPTION, '')}
                                            tabIndex={2}
                                            data-sherpherd="tour-product-step-5"
                                            onChange={this.onFormChange}
                                        />
                                    </GSWidgetContent>
                                </GSWidget>
                                {/*IMAGE*/}
                                <GSWidget className={"gs-widget "}>
                                    <GSWidgetHeader className={'widget__header widget__header--text-align-right'}>
                                        <Trans i18nKey="component.product.addNew.images.title">
                                            Images
                                        </Trans>
                                    </GSWidgetHeader>
                                    <GSWidgetContent data-sherpherd="tour-product-step-6">
                                        <div className="image-drop-zone" hidden={this.state.prodImageList.length > 0}>
                                            <Dropzone onDrop={this.onImageUploaded}>
                                                {({getRootProps, getInputProps}) => (
                                                    <section>
                                                        <div {...getRootProps()}>
                                                            <input {...getInputProps()}
                                                                   accept={ImageUploadType.JPEG + ',' + ImageUploadType.PNG + ',' + ImageUploadType.GIF}/>
                                                            <p><FontAwesomeIcon icon={'upload'}
                                                                                className="image-drop-zone__icon"/></p>
                                                            <p>
                                                                <GSTrans t="component.product.addNew.images.dragAndDrop"
                                                                         values={{maxSize: this.IMAGE_MAX_SIZE_BY_MB}}>
                                                                    dragAndDrop
                                                                </GSTrans>
                                                            </p>
                                                            {/*<p>*/}
                                                            {/*<Trans i18nKey="component.product.addNew.images.uploadRules">*/}
                                                            {/*dragAndDrop*/}
                                                            {/*</Trans>*/}
                                                            {/*</p>*/}
                                                        </div>
                                                    </section>
                                                )}
                                            </Dropzone>
                                        </div>
                                        <div className="image-widget__container"
                                             hidden={this.state.prodImageList.length === 0}>
                                            {this.state.prodImageList.map(
                                                (item, index) => {
                                                    return (<ImageView
                                                        key={(item.id ? item.id : item.name) + index}
                                                        src={item}
                                                        arrIndex={index}
                                                        isMain={this.isMainImage(index)}
                                                        onRemoveCallback={this.onRemoveImage}
                                                        onSelectCallback={this.onSelectMainImage}/>)
                                                })}
                                            <span
                                                className="image-widget__image-item image-widget__image-item--no-border">
                                        <ImageUploader
                                            hidden={this.state.prodImageList.length >= this.IMAGE_MAX_LENGTH}
                                            accept={[ImageUploadType.JPEG, ImageUploadType.PNG, ImageUploadType.GIF]}
                                            multiple={true}
                                            text="Add more photo"
                                            maximumFileSizeByMB={this.IMAGE_MAX_SIZE_BY_MB}
                                            onChangeCallback={this.onImageUploaded}/>
                                    </span>
                                        </div>
                                        <div className="image-widget__error-wrapper">
                                            <AlertInline
                                                text={i18next.t("component.product.addNew.images.errAmountMessage")}
                                                type="error"
                                                nonIcon
                                                hidden={this.state.isValidImageAmount}
                                            />
                                        </div>
                                    </GSWidgetContent>
                                </GSWidget>
                                {/*PRICING*/}
                                <GSWidget className={"gs-widget "}>
                                    <GSWidgetHeader>
                                        <Trans i18nKey="page.product.create.pricing">
                                            Pricing
                                        </Trans>
                                    </GSWidgetHeader>
                                    <GSWidgetContent>
                                        <div className="row">

                                            {/*LISTING PRICE*/}
                                            {(this.state.varLength === 0 && this.state.depositLength === 0) &&
                                            <div className="col-lg-6 col-md-6 col-sm-12 pl-0 pr-2">
                                                <Label for={'productPrice'} className="gs-frm-control__title">
                                                    <Trans i18nKey="component.product.addNew.pricingAndInventory.price">
                                                        Price
                                                    </Trans>
                                                </Label>
                                                <CryStrapInput
                                                    key={this.state.symbolCode}
                                                    disable={this.disabledUpdatePrice}
                                                    ref={this.refProdPrice}
                                                    name={'productPrice'}
                                                    data-sherpherd="tour-product-step-7.1"
                                                    thousandSeparator=","
                                                    unit={this.state.symbolCode}
                                                    default_value={
                                                        this.state.prodPrice
                                                    }
                                                    min_value={0}
                                                    max_value={Constants.VALIDATIONS.PRODUCT.MAX_PRICE}
                                                    on_change_callback={this.onChangePrice}
                                                    position={CurrencyUtils.isPosition(this.state.symbolCode)}
                                                    precision={CurrencyUtils.isCurrencyInput(this.state.symbolCode) && '2'}
                                                    decimalScale={CurrencyUtils.isCurrencyInput(this.state.symbolCode) && 2}
                                                />
                                            </div>
                                            }
                                            {/*SELLING PRICE*/}
                                            {(this.state.varLength === 0 && this.state.depositLength === 0) &&
                                            <div className="col-lg-6 col-md-6 col-sm-12 pl-0 pr-0">
                                                <Label for={'productDiscountPrice'} className="gs-frm-control__title">
                                                    <Trans
                                                        i18nKey="component.product.addNew.pricingAndInventory.discountPrice">
                                                        Discount Price
                                                    </Trans>
                                                </Label>
                                                <CryStrapInput
                                                    // key={'dp'+this.defaultValue(ProductModelKey.ORG_PRICE, this.state.prodPrice)}
                                                    ref={this.refProdDiscount}
                                                    id={'productDiscountPrice'}
                                                    name={'productDiscountPrice'}
                                                    data-sherpherd="tour-product-step-7.2"
                                                    thousandSeparator=","
                                                    key={this.state.prodPrice + this.state.prodCostPrice + this.state.symbolCode}
                                                    unit={this.state.symbolCode}
                                                    default_value={
                                                        this.state.prodDiscountPrice
                                                    }
                                                    custom_err={this.state.errorValidSellingPrice}
                                                    min_value={this.state.prodCostPrice < 1000 ? 0 : this.state.prodCostPrice}
                                                    max_value={this.state.prodPrice}
                                                    on_change_callback={(price) => {
                                                        this.handleProdDiscountPrice(price)
                                                        this.setState({
                                                            prodDiscountPrice: price || 0
                                                        })
                                                        // this.onFormChange();
                                                    }}
                                                    required={false}
                                                    disable={this.disabledUpdatePrice}
                                                    position={CurrencyUtils.isPosition(this.state.symbolCode)}
                                                    precision={CurrencyUtils.isCurrencyInput(this.state.symbolCode) && '2'}
                                                    decimalScale={CurrencyUtils.isCurrencyInput(this.state.symbolCode) && 2}

                                                />
                                            </div>
                                            }
                                            {/*COST PRICE*/}
                                            {(this.state.varLength === 0 && this.state.depositLength === 0) &&
                                            <div className="col-lg-6 col-md-6 col-sm-12 pl-0 pr-2">
                                                <Label for={'productPrice'} className="gs-frm-control__title">
                                                    <Trans
                                                        i18nKey="component.product.addNew.pricingAndInventory.costPrice">
                                                        Price
                                                    </Trans>
                                                </Label>
                                                <CryStrapInput
                                                    ref={this.refProdCostPrice}
                                                    data-sherpherd="tour-product-step-7.3"
                                                    name={'productCostPrice'}
                                                    thousandSeparator=","
                                                    key={this.state.prodPrice + this.state.prodDiscountPrice + this.state.symbolCode}
                                                    unit={this.state.symbolCode}
                                                    default_value={
                                                        this.state.prodCostPrice
                                                    }
                                                    min_value={0}
                                                    max_value={this.state.prodDiscountPrice}
                                                    on_change_callback={(price) => {
                                                        this.setState({
                                                            prodCostPrice: price || 0
                                                        })
                                                        this.onFormChange();
                                                    }}
                                                    required={true}
                                                    disable={this.disabledUpdatePrice}
                                                    position={CurrencyUtils.isPosition(this.state.symbolCode)}
                                                    precision={CurrencyUtils.isCurrencyInput(this.state.symbolCode) && '2'}
                                                    decimalScale={CurrencyUtils.isCurrencyInput(this.state.symbolCode) && 2}
                                                />
                                            </div>
                                            }
                                            {
                                                // VAT
                                                <div className="col-lg-6 col-md-6 col-sm-12  pl-2 pr-0">
                                                    <div className="form-group">
                                                        <Label className="gs-frm-control__title">
                                                            <Trans i18nKey="page.setting.VAT.titleBox"></Trans>
                                                        </Label>
                                                        <UikSelect
                                                            className={'w-100 ' + (
                                                                this.disabledUpdatePrice ? 'disabled' : ''
                                                            )}
                                                            onChange={this.handleSelectedVAT}
                                                            value={[this.state.defaultVAT]}
                                                            options={this.state.listVAT.map(item => {
                                                                return (
                                                                    {
                                                                        value: item.id,
                                                                        label: item.name == 'tax.value.include' ? i18next.t('page.setting.VAT.table.defaultValue') : item.name
                                                                    }
                                                                )
                                                            })}
                                                        />
                                                    </div>
                                                </div>
                                            }
                                            {
                                                //SHOW LISTING PRODUCT
                                                this.state.storeListing &&
                                                <div className="col-lg-12 col-md-12 col-sm-12  pl-2 pr-0">
                                                    <div className="form-group">
                                                        <AvCustomCheckbox
                                                            key={this.state.storeListing}
                                                            name='enabledListing'
                                                            value={this.state.enabledListing}
                                                            disabled={!this.state.storeListing.enabledProduct || this.disabledUpdatePrice}
                                                            onChange={this.handleCheckEnabledListing}
                                                            label={i18next.t('component.product.addNew.listingWeb')}
                                                        />
                                                    </div>
                                                </div>
                                            }
                                        </div>
                                    </GSWidgetContent>
                                </GSWidget>
                                {/*VARIATION*/}
                                <GSWidget className={"gs-widget "}>
                                    <GSWidgetHeader rightEl={
                                        <>
                                            {this.state.varLength < 2 &&
                                            <GSFakeLink
                                                className={(this.disabledUpdateVariation ? 'disabled cursor-unset' : '')}
                                                onClick={() => this.refProdVariation.current.addVariation()}>
                                                <GSTrans t="component.product.addNew.variations.add"/>
                                            </GSFakeLink>
                                            }
                                        </>
                                    }>
                                        <Trans i18nKey="component.product.addNew.variations.title">
                                            Variations
                                        </Trans>
                                    </GSWidgetHeader>
                                    <GSWidgetContent>
                                        <p className="color-gray">
                                            <GSTrans t={"page.product.create.variation.description"}/>
                                        </p>
                                        <ProductFormVariationSelector ref={this.refProdVariation}
                                                                      onLengthChange={this.onVariationLengthChange}
                                                                      mode={this.props.mode}
                                                                      costPrice={this.state.prodCostPrice}
                                                                      price={this.state.prodPrice}
                                                                      discountPrice={this.state.prodDiscountPrice}
                                                                      sku=""
                                                                      stock={0}
                                                                      models={this.props.item ? this.props.item.models : null}
                                                                      onVariationRowsChange={this.onChangeVariationRow}
                                                                      checkVariationForWholesale={this.checkVariationDataForWholesale}
                                                                      imgList={this.state.prodImageList}
                                                                      onImageUploaded={this.onImageUploaded}
                                                                      depositLength={this.state.depositLength}
                                                                      onEditDetail={this.onClickEditVariation}
                                                                      onSaveStock={this.onSaveStock}
                                                                      branchList={this.props.branchList}
                                                                      fullBranchList={this.props.fullBranchList}
                                                                      item={this.getModelForMultipleBranchUpdate()}
                                                                      prodName={this.state.prodName}
                                                                      depositBarcodeList={this.state.barcodeDepositList}
                                                                      onChange={this.onFormChange}
                                                                      onChangeImeiModal={this.onFormChangeImeiModal}
                                                                      disabledPrice={this.disabledUpdatePrice}
                                                                      disabledStock={this.disabledUpdateStock}
                                                                      disabledVariation={this.disabledUpdateVariation}
                                                                      onChangeBarcodeList={(barcodeList => this.setState({barcodeVariationList: barcodeList}))}
                                                                      statusManageInventory={this.state.manageInventory}
                                                                      listInventory={this.getDefaultInventories()}
                                                                      groupItemModelWholesale={this.groupItemModelWholesale}
                                                                      settingWholesale={this.state.isConfigWholesalePrice}
                                                                      customErr={this.state.errorValidSellingPrice}
                                                                      totalWholeSaleList={this.state.totalWholeSaleList}
                                                                      variationRemoved={(e) => this.getVariationRemove(e)}
                                                                      symbolCode={this.state.symbolCode}

                                        />
                                    </GSWidgetContent>
                                </GSWidget>
                                {/*UNIT*/}
                                <GSWidget className={"gs-widget "}>
                                    <GSWidgetHeader className="w-100 border-bottom-0">
                                        <span class="gs-frm-control__title">
                                            <Trans i18nKey="component.product.addNew.unit.title">
                                                UNIT
                                            </Trans>
                                        </span>
                                    </GSWidgetHeader>
                                    <GSWidgetContent className="m-0 p-0">
                                        {this.state.isFetchingConversion ? (
                                            <div className="m-3"><Loading style={LoadingStyle.DUAL_RING_GREY}/></div>
                                        ) : (
                                            <>
                                                <div className="w-100 p-2 pl-3 border-bottom">
                                                    <DropdownSearchForm
                                                        placeholderSearch={i18next.t(`component.product.addNew.unit.search`)}
                                                        conversionUnitId={this.state.unitId}
                                                        conversionUnitName={this.state.unitName}
                                                        mainUnit={this.state.unitId}
                                                        unitSelected={this.state.unitSelected}
                                                        onChange={this.handleChangeUnit}
                                                        parentClass={"w-30"}
                                                    />
                                                    <div
                                                        className="form-group mt-3 mb-0 d-flex justify-content-start align-items-center">
                                                        <UikCheckbox
                                                            key="2"
                                                            name='conversionUnitCheckbox'
                                                            className="text-capitalize title-custom"
                                                            value=""
                                                            label={i18next.t('page.productDetail.addConversionUnit')}
                                                            checked={this.state.isConfigConversionUnit}
                                                            onChange={(e) => this.handleCheckConversionUnit(e.currentTarget.checked)}
                                                        />
                                                        <GSTooltip className="mb-2"
                                                                   message={i18next.t('page.productDetail.text.add.more.conversion.unit.to.manage.product')}/>
                                                    </div>
                                                </div>
                                                {this.state.isConfigConversionUnit && (
                                                    <div className="p-3 bg-light-white">
                                                        {MANAGE_INVENTORY[0].value !== this.state.manageInventory ? (
                                                            <small>
                                                                <GSTrans
                                                                    t={"page.productDetail.message.not.support.conversion.unit.for.product.manage.by.imei.that.time"}/>

                                                            </small>
                                                        ) : (
                                                            <div
                                                                className="d-flex justify-content-between align-items-center mt-2 mb-2">
                                                                {this.state.totalConversionUnitItem > 0 && !this.state.isRemoveConversionUnit ? (
                                                                    <p className="font-italic font-size-12px text-secondary">
                                                                        {i18next.t('page.productDetail.message.added.conversion.units', {x: this.state.totalConversionUnitItem})} {' '}
                                                                        {this.state.totalVariationConfigUnitItem[0] != null &&
                                                                        <span>
                                                                            {i18next.t('page.productDetail.message.added.conversion.units.variation', {x: this.state.totalVariationConfigUnitItem.length})}
                                                                        </span>}
                                                                    </p>
                                                                ) : (
                                                                    <p className="font-italic font-size-12px text-secondary">
                                                                        <GSTrans
                                                                            t={"page.productDetail.text.dont.add.any.conversion.unit"}/>
                                                                    </p>
                                                                )}


                                                                <GSButton success marginRight
                                                                          onClick={() => this.configUnitConversion()}>
                                                                    <GSTrans t={"common.btn.configure"}/>
                                                                </GSButton>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </>
                                        )}

                                    </GSWidgetContent>
                                </GSWidget>
                                {/* WHOLESALE PRICING */}
                                <GSWidget className={"gs-widget "}>
                                    {this.state.isFetchingWholesale ? (
                                        <div className="m-3"><Loading style={LoadingStyle.DUAL_RING_GREY}/></div>
                                    ) : (
                                        <>
                                            <GSWidgetHeader>
                                                <div
                                                    className="form-group mt-2 mb-0 d-flex justify-content-start align-items-center">
                                                    <UikCheckbox
                                                        key="1"
                                                        name='enabledListing'
                                                        className="text-capitalize title-custom"
                                                        value=""
                                                        onChange={(e) => this.handleCheckEnabledWholeSalePrice(e.currentTarget.checked)}
                                                        label={i18next.t('component.product.wholesalePricing.add')}
                                                        checked={this.state.isConfigWholesalePrice}
                                                    />
                                                </div>
                                            </GSWidgetHeader>
                                            {!this.state.isConfigWholesalePrice && this.state.isPromotionCampaign && (
                                                <div className="alert alert-warning w-50 m-2" role="alert">
                                                    <GSComponentTooltip
                                                        placement={GSComponentTooltipPlacement.BOTTOM}
                                                        interactive
                                                        style={{
                                                            display: 'inline'
                                                        }}
                                                        html={
                                                            <GSTrans
                                                                t="component.wholesalePrice.message.hover.progress.promotion.campaign"
                                                            >
                                                            </GSTrans>
                                                        }
                                                    >
                                                        <ExclamationTriangle
                                                            style={{color: '#FFCE31'}}
                                                            width={16}
                                                            height={16}
                                                        />
                                                    </GSComponentTooltip>
                                                    <span className="pl-2 pt-1">
                                                        <GSTrans
                                                            t={"component.wholesalePrice.product.in.progress.promotion.campaign"}/>
                                                    </span>
                                                </div>
                                            )}

                                            {this.state.isConfigWholesalePrice &&
                                            <GSWidgetContent className="bg-light-white">
                                                {this.state.errorValidSellingPrice ? (
                                                    <div className="alert alert-warning" role="alert">
                                                        <ExclamationTriangle
                                                            style={{color: '#FFCE31'}}
                                                            width={16}
                                                            height={16}
                                                        />
                                                        <span
                                                            className="pl-2 pt-1">{this.state.errorValidSellingPrice}</span>
                                                    </div>
                                                ) : (
                                                    <div
                                                        className="d-flex justify-content-between align-items-center mt-1 mb-1 ">
                                                        {this.state.totalWholeSaleList > 0 ? (
                                                            <p className="font-italic font-size-12px text-secondary">
                                                                {i18next.t('component.wholesalePrice.message.added.wholesale.price', {x: this.state.totalWholeSaleList})} {' '}
                                                                {this.state.totalModelWholesale > 0 && this.props.item && this.props.item.hasModel &&
                                                                <span>
                                                                        {i18next.t('component.wholesalePrice.message.total.wholesale.models', {x: this.state.totalModelWholesale})}
                                                                    </span>}
                                                            </p>
                                                        ) : (<p className="font-italic font-size-12px text-secondary">
                                                            <GSTrans
                                                                t={"component.wholesalePrice.warning.dont_configure_any_wholesale_price"}/>
                                                        </p>)}

                                                        <GSButton success marginRight
                                                                  onClick={() => this.configWholesalePricing()}>
                                                            <GSTrans t={"common.btn.configure"}/>
                                                        </GSButton>
                                                    </div>
                                                )
                                                }
                                            </GSWidgetContent>
                                            }
                                        </>
                                    )}
                                </GSWidget>
                                {/*DEPOSIT*/}
                                <PrivateComponent hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.FEATURE_0109]}
                                                  wrapperDisplay={"block"}>
                                    <GSWidget className={"gs-widget "}>
                                        <GSWidgetHeader rightEl={
                                            <>
                                                {this.state.depositLength < 1 &&
                                                <GSFakeLink
                                                    className={(this.disabledUpdateVariation ? 'disabled cursor-unset' : '')}
                                                    onClick={() => this.refProdDeposit.current.addVariation()}>
                                                    <GSTrans t="page.product.create.variation.addDeposit"/>
                                                </GSFakeLink>
                                                }
                                            </>
                                        }>
                                            <Trans i18nKey="page.product.create.variation.deposit">
                                                Deposit
                                            </Trans>
                                            <HintPopupVideo title={"Deposit"}
                                                            category={"ADD_DEPOSIT"}/>
                                        </GSWidgetHeader>
                                        <GSWidgetContent>
                                            <p className="color-gray">
                                                <GSTrans t={"page.product.create.deposit.description"}/>
                                            </p>
                                            <ProductFormDepositSelector ref={this.refProdDeposit}
                                                                        onLengthChange={this.onDepositLengthChange}
                                                                        mode={this.props.mode}
                                                                        costPrice={this.state.prodCostPrice}
                                                                        price={this.state.prodPrice}
                                                                        discountPrice={this.state.prodDiscountPrice}
                                                                        variationRows={this.state.variationRows}
                                                                        sku=""
                                                                        stock={0}
                                                                        models={this.props.item ? this.props.item.models : null}
                                                                        imgList={this.state.prodImageList}
                                                                        onImageUploaded={this.onImageUploaded}
                                                                        onEditDetail={this.onClickEditVariation}
                                                                        onSaveStock={this.onSaveStock}
                                                                        branchList={this.props.branchList}
                                                                        item={this.getModelForMultipleBranchUpdate()}
                                                                        prodName={this.state.prodName}
                                                                        variationBarcodeList={this.state.barcodeVariationList}
                                                                        onChangeBarcodeList={(barcodeList => this.setState({barcodeDepositList: barcodeList}))}
                                                                        onChange={this.onFormChange}
                                                                        disabledPrice={this.disabledUpdatePrice}
                                                                        disabledStock={this.disabledUpdateStock}
                                                                        disabledVariation={this.disabledUpdateVariation}
                                                                        symbolCode={this.state.symbolCode}

                                            />
                                        </GSWidgetContent>
                                    </GSWidget>
                                </PrivateComponent>
                                {/*SEO*/ }
                                <HocSEOEditor ref={ this.refSEOUrl }
                                              langKey={ storageService.getFromLocalStorage(Constants.STORAGE_KEY_INITIAL_LANGUAGE) }
                                              type={ Constants.SEO_DATA_TYPE.BUSINESS_PRODUCT }
                                              data={ this.defaultValue(ProductModelKey.ID, '') }>
                                    <SEOEditor defaultValue={ {
                                        seoTitle: this.defaultValue(ProductModelKey.SEO_TITLE, ''),
                                        seoDescription: this.defaultValue(ProductModelKey.SEO_DESCRIPTION, ''),
                                        seoKeywords: this.defaultValue(ProductModelKey.SEO_KEYWORDS, ''),
                                        seoUrl: this.defaultValue(ProductModelKey.SEO_URL, '')
                                    } }
                                               prefix={ 'product/' }
                                               middleSlug={ ItemUtils.changeNameToLink(this.state.prodName || '') }
                                               postfix={ this.props.item ? `-p${ this.props.item.id }` : '' }
                                               onBlur={ this.onFormChange }
                                               assignDefaultValue={ false }
                                               enableLetterOrNumberOrHyphen={ false }
                                    />
                                </HocSEOEditor>
                            </section>
                            <section className="product-form-page__widget-col product-form-page__widget-col--n2">
                                {/*SALE CHANNELS*/}
                                <GSWidget className="gs-widget sale-channels-info">
                                    <GSWidgetHeader className={'widget__header widget__header--text-align-right'}>
                                        <Trans i18nKey="component.product.addNew.saleChannels.title.sync">
                                            Sale channels
                                        </Trans>
                                    </GSWidgetHeader>
                                    <GSWidgetContent>
                                        {this.renderSaleChannels()}
                                    </GSWidgetContent>
                                </GSWidget>
                                {/*COLLECTIONS*/}
                                <GSWidget className="gs-widget form-collection-general">
                                    <GSWidgetHeader>
                                        <Trans i18nKey="component.product.addNew.productInformation.collection.title">
                                            Collection
                                        </Trans>
                                    </GSWidgetHeader>
                                    <GSWidgetContent>
                                        <PrivateComponent wrapperDisplay={"block"}
                                                          hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.FEATURE_0111]}>
                                            <ProductFormCollectionSelector2
                                                redirectWithoutSave={this.redirectToCollection}
                                                redirectWithSave={this.redirectToCollectionWithSave}
                                                itemId={this.defaultValue(ProductModelKey.ID, null)}
                                                onChange={this.onCollectionChange}
                                                collectionList={this.props.collectionList}
                                                collectionDefaultList={this.props.collectionDefaultList ? this.props.collectionDefaultList : []}
                                            />
                                        </PrivateComponent>
                                    </GSWidgetContent>
                                </GSWidget>
                                {/*WAREHOUSING*/}
                                <GSWidget className="gs-widget gs-witget-warehousing">
                                    <GSWidgetHeader rightEl={
                                        <>
                                            {this.state.varLength === 0 && this.state.depositLength === 0 && this.props.mode === ProductFormEditorMode.EDIT &&
                                            <GSFakeLink className={this.disabledUpdateStock ? 'disabled' : ''}
                                                        onClick={this.state.manageInventory === MANAGE_INVENTORY[1].value ?
                                                            () => this.handleOpenManagedInventoryModal(this.props.branchList)
                                                            : () => {
                                                                if (this.disabledUpdateStock) return
                                                                this.setState({
                                                                    isShowUpdateStock: true,
                                                                    selectedBranches: this.props.branchList.map(b => b.id)
                                                                })
                                                            }}>
                                                <GSTrans t="page.product.create.updateStockModal.title"/>
                                            </GSFakeLink>
                                            }
                                        </>
                                    }>
                                        <GSTrans t="page.product.create.warehousing"/>
                                    </GSWidgetHeader>
                                    <GSWidgetContent>
                                        {this.state.varLength + this.state.depositLength === 0 && this.props.mode === ProductFormEditorMode.EDIT &&
                                        <div className="d-flex justify-content-between align-items-center">
                                            <label className="gs-frm-input__label">SKU (Stock keeping unit)</label>
                                            <GSFakeLink className="mb-2" onClick={() => this.setState({
                                                isShowUpdateSKU: true,
                                                selectedBranches: this.props.branchList.map(b => b.id)
                                            })}>
                                                <GSTrans t={"page.product.editSku"}/>
                                            </GSFakeLink>
                                        </div>}
                                        {this.state.varLength + this.state.depositLength === 0 && this.props.mode === ProductFormEditorMode.ADD_NEW &&
                                        <AvField
                                            onChange={(e, v) => {
                                                this.ipSku = v
                                            }}
                                            onBlur={this.onFormChange}
                                            value={
                                                this.defaultValue(ProductModelKey.PARENT_SKU, '')
                                            }
                                            name={'productSKU'}
                                            label="SKU (Stock keeping unit)"
                                            validate={{
                                                maxLength: {
                                                    value: 100,
                                                    errorMessage: i18next.t("common.validation.char.max.length", {x: 100})
                                                }
                                            }}/>
                                        }
                                        {/*BAR CODE*/}
                                        {this.state.varLength + this.state.depositLength === 0 &&
                                        <AvField
                                            value={
                                                this.props.mode === ProductFormEditorMode.EDIT ? (this.props.item.barcode || this.props.item.id) + '' : ''
                                            }
                                            name={'barcode'}
                                            label={i18next.t`page.product.list.printBarCode.barcode`}
                                            validate={{
                                                maxLength: {
                                                    value: 48,
                                                    errorMessage: i18next.t("common.validation.char.max.length", {x: 48})
                                                },
                                                ...FormValidate.async((value, ctx, input, cb) => {
                                                    if (this.state.isValidBarcode) {
                                                        cb(true)
                                                    } else {
                                                        cb(i18next.t`page.product.create.existedBarcode`)
                                                    }
                                                })
                                            }}
                                            style={{
                                                fontFamily: 'monospace'
                                            }}
                                            onBlur={this.onFormChange}
                                            onChange={() => this.setState({isValidBarcode: true})}
                                        />
                                        }
                                        {/*MANAGE INVENTORY*/}
                                        <AvField
                                            type="select"
                                            name="manageInventory"
                                            label={`${i18next.t("page.product.allProduct.productDetail.manageInventory")}`}
                                            className='dropdown-box w-100'
                                            value={this.state.manageInventory}
                                            onChange={this.handleChangeManageInventory}
                                            disabled={this.props.mode === ProductFormEditorMode.EDIT ? true : false}
                                        >
                                            {MANAGE_INVENTORY.map(manageInventory => {
                                                return (
                                                    <option key={manageInventory.value} value={manageInventory.value}>
                                                        {manageInventory.label}
                                                    </option>
                                                )
                                            })}
                                        </AvField>

                                        {MANAGE_INVENTORY[0].value != this.state.manageInventory &&
                                        <div className="Notice-product-quantity">
                                            <span>{i18next.t('common.txt.notice')}: </span>{i18next.t('page.product.allProduct.productDetail.Notice')}
                                        </div>
                                        }


                                        {/*// STOCK BY IMEI SERIAL*/}
                                        {MANAGE_INVENTORY[0].value != this.state.manageInventory &&
                                        <div hidden={!(this.state.varLength === 0 && this.state.depositLength === 0)}>
                                            <div className='row' style={{width: "0", height: 0, overflow: "hidden"}}
                                                 hidden={this.props.mode !== ProductFormEditorMode.ADD_NEW}>
                                                <div className='col pl-0'>
                                                    <CryStrapInput
                                                        ref={this.refProdStock}
                                                        data-sherpherd="tour-product-step-8"
                                                        name={'productQuantity'}
                                                        thousandSeparator=","
                                                        precision="0"
                                                        unit={CurrencySymbol.NONE}
                                                        default_value={
                                                            this.defaultValue(ProductModelKey.TOTAL_ITEM, 0)
                                                        }
                                                        max_value={this.state.varLength + this.state.depositLength === 0 ? 1_000_000 : undefined}
                                                        min_value={0}
                                                    />
                                                </div>
                                                <GSButton primary onClick={this.handleApplyAllBranches}>Apply
                                                    All</GSButton>
                                            </div>
                                            <div className='branch-list-stock__wrapper'>
                                                {this.props.branchList.map((branch, index) => (
                                                    <Row key={Math.random()}
                                                         className='branch-list-stock__wrapper__row'>
                                                        <Col sm={7} className='font-weight-500'>{branch.name}</Col>
                                                        <Col sm={5} className='pl-2 pr-2'>
                                                            <CryStrapInput
                                                                className='mb-0'
                                                                name={`productQuantity-${branch.id}`}
                                                                thousandSeparator=","
                                                                precision="0"
                                                                unit={CurrencySymbol.NONE}
                                                                default_value={this.getDefaultBranchStock(branch.id)}
                                                                min_value={0}
                                                                max_value={this.state.varLength + this.state.depositLength === 0 ? 1_000_000 : undefined}
                                                                onClick={() => this.handleOpenManagedInventoryModal([branch.id])}
                                                            />
                                                        </Col>
                                                    </Row>
                                                ))}
                                            </div>
                                        </div>
                                        }

                                        {/*// STOCK BY PRODUCT*/}
                                        {MANAGE_INVENTORY[0].value == this.state.manageInventory &&
                                        <div hidden={!(this.state.varLength === 0 && this.state.depositLength === 0)}>
                                            <Label for={'productQuantity'} className="gs-frm-control__title">
                                                <Trans i18nKey="component.product.addNew.pricingAndInventory.stock">
                                                    Stock
                                                </Trans>
                                            </Label>
                                            <div className='row'
                                                 hidden={this.props.mode !== ProductFormEditorMode.ADD_NEW}>
                                                <div className='col pl-0'>
                                                    <CryStrapInput
                                                        ref={this.refProdStock}
                                                        data-sherpherd="tour-product-step-8"
                                                        name={'productQuantity'}
                                                        thousandSeparator=","
                                                        precision="0"
                                                        unit={CurrencySymbol.NONE}
                                                        default_value={
                                                            this.defaultValue(ProductModelKey.TOTAL_ITEM, 0)
                                                        }
                                                        max_value={this.state.varLength + this.state.depositLength === 0 ? 1_000_000 : undefined}
                                                        min_value={0}
                                                    />
                                                </div>
                                                <GSButton primary onClick={this.handleApplyAllBranches}>Apply
                                                    All</GSButton>
                                            </div>
                                            <div className='branch-list-stock__wrapper'>
                                                {this.props.branchList.map((branch, index) => (
                                                    <Row key={Math.random()}
                                                         className='branch-list-stock__wrapper__row'>
                                                        <Col sm={7} className='font-weight-500'>{branch.name}</Col>
                                                        <Col sm={5} className='pl-2 pr-2'>
                                                            {
                                                                this.props.mode === ProductFormEditorMode.EDIT
                                                                    ? <div
                                                                        className={this.disabledUpdateStock ? 'disabled' : 'cursor--pointer'}
                                                                        onClick={() => {
                                                                            if (this.disabledUpdateStock) return
                                                                            this.setState({
                                                                                isShowUpdateStock: true,
                                                                                selectedBranches: [branch.id]
                                                                            })
                                                                        }}>
                                                                        <CryStrapInput
                                                                            className='branch-edit-stock mb-0'
                                                                            disable={true}
                                                                            name={`productQuantity-${branch.id}`}
                                                                            thousandSeparator=","
                                                                            precision="0"
                                                                            unit={CurrencySymbol.NONE}
                                                                            default_value={this.getDefaultBranchStock(branch.id)}
                                                                            min_value={0}
                                                                            max_value={this.state.varLength + this.state.depositLength === 0 ? 1_000_000 : undefined}
                                                                        />
                                                                    </div>
                                                                    : <CryStrapInput
                                                                        className='mb-0'
                                                                        name={`productQuantity-${branch.id}`}
                                                                        thousandSeparator=","
                                                                        precision="0"
                                                                        unit={CurrencySymbol.NONE}
                                                                        default_value={this.getDefaultBranchStock(branch.id)}
                                                                        min_value={0}
                                                                        max_value={this.state.varLength + this.state.depositLength === 0 ? 1_000_000 : undefined}
                                                                        on_blur={(value) => this.handleChangeBranchStock(branch.id, value)}
                                                                    />
                                                            }
                                                        </Col>
                                                    </Row>
                                                ))}
                                            </div>
                                        </div>
                                        }
                                        {/*REMAINING*/}
                                        {
                                            this.props.mode === ProductFormEditorMode.EDIT &&
                                            <div className='d-flex justify-content-between'>
                                                <Label for='remaining' className="gs-frm-control__title text-black-100">
                                                    <GSTrans
                                                        t="component.product.addNew.pricingAndInventory.remainingStock"/>
                                                </Label>
                                                <GSFakeLink
                                                    key={this.calculateRemainingStockByBranch()}
                                                    onClick={() => this.setState({toggleRemainingSoldItemModal: true})}>
                                                    {
                                                        NumberUtils.formatThousand(this.calculateRemainingStockByBranch())
                                                    }
                                                </GSFakeLink>
                                            </div>
                                        }
                                        {/*SOLD COUNT*/}
                                        {
                                            this.props.mode === ProductFormEditorMode.EDIT &&
                                            <div className='d-flex justify-content-between'>
                                                <Label for='soldItem' className="gs-frm-control__title text-black-100">
                                                    <GSTrans
                                                        t="component.product.addNew.pricingAndInventory.soldCount"/>
                                                </Label>
                                                <GSFakeLink
                                                    key={this.calculateSoldCountByBranch()}
                                                    onClick={() => this.setState({toggleSoldCountModal: true})}>
                                                    {
                                                        NumberUtils.formatThousand(this.calculateSoldCountByBranch())
                                                    }
                                                </GSFakeLink>
                                            </div>
                                        }
                                        <Row>
                                            <Col md={12} className="p-0 mt-2">
                                                <PrivateComponent
                                                    wrapperDisplay={"block"}
                                                    hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.FEATURE_0309]}
                                                >
                                                    <AvCustomCheckbox
                                                        name={'showOutOfStock'}
                                                        color="blue"
                                                        label={i18next.t("component.product.addNew.pricingAndInventory.showOutOfStock")}
                                                        value={this.defaultValue(ProductModelKey.SHOW_OUT_OF_STOCK, true)}
                                                        onChange={this.changeShowOutOfStock}
                                                    />
                                                </PrivateComponent>
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Col md={12} className="p-0 mt-2">
                                                <PrivateComponent
                                                    wrapperDisplay={"block"}
                                                    // hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.FEATURE_0309]}
                                                >
                                                    <AvCustomCheckbox
                                                        name={'isHideStock'}
                                                        color="blue"
                                                        label={i18next.t('page.product.allProduct.productDetail.hideStock')}
                                                        value={this.state.isHideStock}
                                                        onChange={this.changeIsHideStock}
                                                    />
                                                </PrivateComponent>
                                            </Col>
                                        </Row>

                                    </GSWidgetContent>
                                </GSWidget>
                                {/*Shipping*/}
                                <GSWidget className={"gs-widget "}>
                                    <GSWidgetHeader className={'widget__header widget__header--text-align-right'}>
                                        <Trans i18nKey="component.product.addNew.shipping.title">
                                            Shipping
                                        </Trans>
                                        <GSTooltip message={i18next.t('page.product.create.dimensionHint')}/>
                                    </GSWidgetHeader>
                                    <GSWidgetContent>
                                        {/*Weight*/}
                                        <Label for={'productWeight'} className="gs-frm-control__title">
                                            <Trans i18nKey="component.product.addNew.shipping.weight">
                                                Weight
                                            </Trans>
                                        </Label>
                                        <CryStrapInput
                                            ref={this.refProdWeight}
                                            name={'productWeight'}
                                            thousandSeparator=","
                                            precision="0"
                                            unit={CurrencySymbol.G}
                                            min_value={0}
                                            on_blur={this.onFormChange}
                                            default_value={
                                                this.defaultValueWithParent(
                                                    ProductModelKey.SHIPPING_INFO, 'weight', 0
                                                )
                                            }
                                        />
                                        <div className="row">
                                            {/*Length*/}
                                            <div className="col-lg-4 col-md-4 col-sm-12 pl-0 pr-1">
                                                <Label for={'productLength'} className="gs-frm-control__title">
                                                    <Trans i18nKey="component.product.addNew.shipping.length">
                                                        Length
                                                    </Trans>
                                                </Label>
                                                {/*<HelpTooltip*/}
                                                {/*message="price"*/}
                                                {/*/>*/}
                                                <CryStrapInput
                                                    ref={this.refProdLength}
                                                    name={'productLength'}
                                                    thousandSeparator=","
                                                    precision="0"
                                                    unit={CurrencySymbol.CM}
                                                    min_value={0}
                                                    on_blur={this.onFormChange}
                                                    default_value={
                                                        this.defaultValueWithParent(
                                                            ProductModelKey.SHIPPING_INFO, 'length', 0
                                                        )
                                                    }/>
                                            </div>
                                            {/*Width*/}
                                            <div className="col-lg-4 col-md-4 col-sm-12 px-1">
                                                <Label for={'productWidth'} className="gs-frm-control__title">
                                                    <Trans i18nKey="component.product.addNew.shipping.width">
                                                        Width
                                                    </Trans>
                                                </Label>
                                                <CryStrapInput
                                                    ref={this.refProdWidth}
                                                    name={'productWidth'}
                                                    thousandSeparator=","
                                                    precision="0"
                                                    unit={CurrencySymbol.CM}
                                                    min_value={0}
                                                    on_blur={this.onFormChange}
                                                    default_value={
                                                        this.defaultValueWithParent(
                                                            ProductModelKey.SHIPPING_INFO, 'width', 0
                                                        )
                                                    }/>
                                            </div>
                                            {/*Height*/}
                                            <div className="col-lg-4 col-md-4 col-sm-12 pl-1 pr-0">
                                                <Label for={'productHeight'} className="gs-frm-control__title">
                                                    <Trans i18nKey="component.product.addNew.shipping.height">
                                                        Height
                                                    </Trans>
                                                </Label>
                                                <CryStrapInput
                                                    ref={this.refProdHeight}
                                                    name={'productHeight'}
                                                    thousandSeparator=","
                                                    precision="0"
                                                    unit={CurrencySymbol.CM}
                                                    min_value={0}
                                                    on_blur={this.onFormChange}
                                                    default_value={
                                                        this.defaultValueWithParent(
                                                            ProductModelKey.SHIPPING_INFO, 'height', 0
                                                        )
                                                    }/>
                                            </div>
                                        </div>
                                        <p className="color-gray mb-0">
                                            <em>
                                                <Trans i18nKey="component.product.addNew.shipping.note"/>
                                            </em>
                                        </p>
                                    </GSWidgetContent>
                                </GSWidget>
                                {/*PRIORITY*/}
                                <GSWidget className={"gs-widget "}>
                                    <GSWidgetHeader>
                                        <Trans i18nKey="productList.sort.priority">
                                            Priority
                                        </Trans>
                                        <GSTooltip message={i18next.t('page.product.create.priorityHint')}/>
                                    </GSWidgetHeader>
                                    <GSWidgetContent>
                                        <AvFieldCurrency
                                            name="productPriority"
                                            validate={{
                                                ...FormValidate.minValue(0),
                                                ...FormValidate.maxValue(100_000_000, true)
                                            }}
                                            placeholder={i18next.t('page.product.create.priority.placeholder')}
                                            className="priority-field"
                                            parentClassName="priority-field__wrapper"
                                            onChange={this.onFormChange}
                                            value={this.defaultValue(ProductModelKey.PRIORITY, null)}
                                        />
                                    </GSWidgetContent>
                                </GSWidget>

                                {/*PLATFORM*/}
                                <GSWidget className={"gs-widget "}>
                                    <GSWidgetHeader>
                                        <Trans i18nKey="productList.filter.platform">
                                            Platform
                                        </Trans>
                                        <GSTooltip message={i18next.t('page.product.create.platformHint')}/>
                                    </GSWidgetHeader>
                                    <GSWidgetContent style={{
                                        display: 'flex',
                                        flexDirection: 'column'
                                    }}>
                                        <UikCheckbox
                                            name={'onApp'}
                                            color={"blue"}
                                            label={i18next.t("component.product.addNew.platform.app")}
                                            disabled={!TokenUtils.hasAllPackageFeatures([PACKAGE_FEATURE_CODES.APP_PACKAGE])}
                                            checked={this.state.onApp}
                                            onChange={this.onClickPlatform}
                                        />
                                        <UikCheckbox
                                            name={'onWeb'}
                                            color={"blue"}
                                            label={i18next.t("component.product.addNew.platform.web")}
                                            checked={this.state.onWeb}
                                            onChange={this.onClickPlatform}
                                        />
                                        <UikCheckbox
                                            name={'inStore'}
                                            color={"blue"}
                                            label={i18next.t("component.product.addNew.platform.instore")}
                                            disabled={!TokenUtils.hasAllPackageFeatures([PACKAGE_FEATURE_CODES.POS_PACKAGE])}
                                            checked={this.state.inStore}
                                            onChange={this.onClickPlatform}
                                        />
                                        <UikCheckbox
                                            name={'inGosocial'}
                                            color={"blue"}
                                            label={i18next.t("component.product.addNew.platform.gosocial")}
                                            disabled={!TokenUtils.hasAllPackageFeatures([PACKAGE_FEATURE_CODES.SOCIAL_PACKAGE])}
                                            checked={this.state.inGosocial}
                                            onChange={this.onClickPlatform}
                                        />
                                        {/* {!this.state.isValidPlatform && <div style={{"color": "var(--danger)"}}>
                                            <Trans i18nKey="component.product.addNew.platform.require"></Trans>
                                        </div>} */}
                                    </GSWidgetContent>
                                </GSWidget>
                            </section>
                        </section>
                    </AvForm>
                </GSContentBody>
                <AlertModal ref={(el) => {
                    this.alertModal = el
                }}/>
                <ConfirmModal ref={(el) => {
                    this.refConfirmModal = el
                }}/>
                <ConfirmModalChildren ref={(el) => {
                    this.refConfirmModalChildren = el
                }}
                                      btnOkName={i18next.t('common.btn.yes')}
                                      btnCancelName={i18next.t('common.btn.no')}>{i18next.t('component.product.addNew.before.sync.shopee')}</ConfirmModalChildren>
                <ConfirmModalChildren ref={(el) => {
                    this.refTikiConfirmModalChildren = el
                }}
                                      btnOkName={i18next.t('common.btn.yes')}
                                      btnCancelName={i18next.t('common.btn.no')}>{i18next.t('component.product.addNew.before.sync.tiki')}</ConfirmModalChildren>
                {this.props.mode === ProductFormEditorMode.EDIT && <>
                    <RemainingSoldItemModal branchList={this.props.fullBranchList}
                                            onClose={() => this.setState({toggleRemainingSoldItemModal: false})}
                                            isToggle={this.state.toggleRemainingSoldItemModal}
                                            modalType={RemainingSoldItemModal.MODAL_TYPE.REMAINING_STOCK}
                                            item={this.props.item}
                    />
                    <RemainingSoldItemModal branchList={this.props.fullBranchList}
                                            onClose={() => this.setState({toggleSoldCountModal: false})}
                                            isToggle={this.state.toggleSoldCountModal}
                                            modalType={RemainingSoldItemModal.MODAL_TYPE.SOLD_COUNT}
                                            item={this.props.item}
                    />
                </>}
            </GSContentContainer>
        )
    }

    onVariationLengthChange(length) {
        this.setState({
            varLength: length
        })
    }

    onDepositLengthChange(length) {
        this.setState({
            depositLength: length
        })
    }

    checkMaxSellingPriceForWholesale(data) {

        ItemService.checkMaxSellingPriceForWholesale(data)
            .then(result => {
                if (result) {
                    let data = result.find(r => r.itemId === this.props.item.id)
                    if (data) {
                        if (data.status === 0) {
                            this.setState({
                                errorValidSellingPrice: i18next.t('component.wholesalePrice.error.wholesale_price_higher_sale_price')
                            })
                        } else {
                            this.setState({
                                errorValidSellingPrice: ''
                            })

                        }
                    }
                }
            })
            .catch(err => {
                console.log(err)
            })
    }

    checkProdDiscountPriceForWholesale(price) {
        let errorValidSellingPrice = this.state.errorValidSellingPrice
        if (price !== 0 && !price) {
            errorValidSellingPrice = i18next.t('component.wholesalePrice.error.please_input_price_first')
        } else {
            errorValidSellingPrice = ''
        }
        this.setState({
            errorValidSellingPrice: errorValidSellingPrice
        })
    }

    handleProdDiscountPrice = debounce((price) => {
        // e.preventDefault()
        if (this.state.isConfigWholesalePrice) {
            let min_value = this.state.prodCostPrice < 1000 ? 1000 : this.state.prodCostPrice
            let max_value = this.state.prodPrice
            if (this.props.item) {
                let data = {
                    lstData: [
                        {
                            itemId: this.props.item.id,
                            modelId: null,
                            newPrice: parseFloat(price)
                        }
                    ]
                }
                if (this.props.item.hasModel) {
                    this.checkProdDiscountPriceForWholesale(price)

                    if (!price || price === undefined || price === null) return
                    if (!(parseFloat(price) >= min_value && parseFloat(price) <= max_value)) return

                }
                if (!this.state.isRemoveWholesalePrice && this.state.isConfigWholesalePrice) {
                    this.checkMaxSellingPriceForWholesale(data)
                }
                this.onFormChange();

            } else {
                this.checkProdDiscountPriceForWholesale(price)
            }
        }
        this.onFormChange();

    }, [500])

    onChangePrice(price) {
        // check discount price, if it is 0, set price to discount
        this.setState({
            prodPrice: price || 0
        })
        this.onFormChange();
    }

    defaultValue(key, defaultV) {
        if (!this.props.item) return defaultV
        return (this.props.item[key] !== undefined && this.props.item[key] !== null) ? this.props.item[key] : defaultV
    }

    onToggleActive(e) {
        e.preventDefault()
        this.setState(state => {
            return {isActive: !state.isActive}
        })
    }

    defaultValueWithParent(parent, key, defaultV) {
        if (!this.props.item) return defaultV
        return this.props.item[parent][key]
    }

    handleOnCancel(e) {
        e.preventDefault()
        this.refConfirmModal.openModal({
            messages: i18next.t('component.product.addNew.cancelHint'),
            okCallback: () => {
                this.setState({
                    onRedirect: true
                })
            }
        })
    }

    onClickRemove(e) {
        e.preventDefault()
        this.refConfirmModal.openModal({
            messages: i18next.t('component.product.edit.remove.hint'),
            okCallback: () => {
                ItemService.remove(this.props.item.id)
                    .then(result => {
                        this.alertModal.openModal({
                            type: AlertInlineType.SUCCESS,
                            messages: i18next.t('component.product.edit.remove.success'),
                            closeCallback: this.redirectToProductList
                        })
                    }, e => {
                        let msgBoxText = i18next.t('component.product.edit.remove.failed')
                        if (e.response?.data?.detail === 'error.incomplete.transfer') {
                            msgBoxText = i18next.t('page.product.detail.commission.notice.notAllowDeleteInCompletedTransfer')
                        }

                        this.alertModal.openModal({
                            type: AlertModalType.ALERT_TYPE_DANGER,
                            messages: msgBoxText
                        })
                    })
            }
        })
    }

    renderRedirect() {
        if (this.state.onRedirect) return <Redirect to='/product/list'/>
    }

    async uploadImageToServer() {
        let promiseArr = []
        for (let image of this.state.prodImageList) {
            if (image.id || image.imageId) continue
            let uploadHandle = await mediaService.uploadFileWithDomain(
                image, MediaServiceDomain.ITEM
            )
            promiseArr.push(uploadHandle)
        }
        return promiseArr
    }

    formatImageData(rawImageResponse) {
        return {
            imageId: rawImageResponse.imageId,
            imageUUID: rawImageResponse.imageUUID,
            height: rawImageResponse.height,
            width: rawImageResponse.width,
            urlPrefix: rawImageResponse.urlPrefix,
            extension: rawImageResponse.extension
        }
    }

    onCateValidCallback(isValid) {
        this.setState({
            isValidCate: isValid
        })
    }

    formatAfterEditByGSEditor(value) {
        return value ? value.replace(/<p>/g, '').replace(/<\/p>/g, '<br>').replace(/\n/g, '<br>') : '';
    }

    createProductModelRequest() {
        const depositModel = this.refProdDeposit.current.getValue()
        const variationModel = this.refProdVariation.current.getValue()
        const models = [...variationModel, ...depositModel]
        const mainIndex = this.state.prodImageMain
        if (mainIndex === 0) {
            return models
        } else {
            models.forEach(m => {
                if (m.imagePosition === null || m.imagePosition === undefined) return
                if (m.imagePosition === mainIndex) {
                    m.imagePosition = 0
                } else {
                    if (m.imagePosition === 0) {
                        m.imagePosition = mainIndex
                    }
                }
            })
            return models
        }
    }

    onClickEditVariation(name) {
        this.setState({
            redirectToVariation: name
        })
        this.onSave()
    }

    onSave() {
        if (!this.isCheckValidOnly) {
            this.setState({
                isSaving: true
            })
        }
        this.refBtnSubmitForm.click()
    }

    /**
     * Using for create new item
     * @param {ItemModel} item
     */
    createStock(item) {
        /**
         * @type {UpdateStockRequestBodyModel}
         */
        let requestBody = {
            lstInventory: []
        }
        if (item.hasModel) {
            requestBody.lstInventory = item.models.map(model => {
                /**
                 * @type {UpdateStockRequestBodyInventoryModel}
                 */
                const inventory = {
                    itemId: item.id,
                    modelId: model.id,
                    stock: model.totalItem,
                    currentStock: 0,
                    type: "SET"
                }
                return inventory
            })
        } else {
            requestBody.lstInventory = [
                {
                    itemId: item.id,
                    stock: item.totalItem,
                    currentStock: 0,
                    type: "SET"
                }
            ]
        }
        return ItemService.updateInventory(requestBody)
    }

    /**
     *
     * @param {ItemModel} productModel
     */
    // start create new item
    startCreateNewItemTask(productModel) {
        // APPLY COLLECTION
        if (TokenUtils.hasAnyPackageFeatures([PACKAGE_FEATURE_CODES.FEATURE_0111])) {
            let itemId, itemRes
            if (productModel.hasModel) {
                productModel.models.forEach(model => {
                    model.inventoryType = InventoryEnum.ACTIONS.SET_STOCK
                    model.inventoryCurrent = model.newStock
                    model.inventoryStock = model.totalItem
                    model.inventoryActionType = InventoryEnum.ACTION_TYPES.FROM_CREATE_AT_ITEM_SCREEN
                })
            } else {
                productModel.lstInventory = this.state.lstInventory
                // add parent sku
                const sku = productModel.parentSku
                productModel.lstInventory.forEach(ivt => {
                    ivt.sku = sku
                    ivt.inventoryType = InventoryEnum.ACTIONS.SET_STOCK
                    ivt.inventoryCurrent = 0
                })
            }
            ItemService.create(productModel)
                .then(async createRes => {
                    itemId = createRes.id
                    this.setState({
                        createdItemId: itemId
                    })
                    itemRes = createRes
                    // save collection
                    return ItemService.createCollectionForItemId(createRes.id,
                        this.state.collectionList
                    )
                })
                .then(result => {
                    if (this.state.redirectToVariation) {
                        this.redirectToVariation(itemRes.models)
                    } else {
                        if (this.state.isConfigWholesalePrice && this.renderPageMode === renderNewPageMode.WHOLESALE_PAGE) {
                            GSToast.commonUpdate()
                            this.redirectToWholesale(this.state.createdItemId)
                        } else if (this.state.isConfigConversionUnit && this.renderPageMode === renderNewPageMode.CONVERSION_UNIT_PAGE) {
                            GSToast.commonUpdate()
                            this.redirectToConversionUnit(this.state.createdItemId, itemRes.models)
                        } else {
                            this.alertModal.openModal({
                                type: AlertModalType.ALERT_TYPE_SUCCESS,
                                messages: i18next.t("component.product.addNew.success.title"),
                                closeCallback: () => {
                                    if (this.state.redirectToCollection) {
                                        return this.redirectToCollection()
                                    }
                                    this.redirectToProductList()
                                }
                            })
                        }
                    }
                })
                .catch((e) => {
                    console.log(e)
                    this.alertModal.openModal({
                        type: AlertModalType.ALERT_TYPE_DANGER,
                        messages: i18next.t("component.product.addNew.failed.title"),
                        closeCallback: () => {
                            this.setState({
                                isSaving: false
                            })
                        }
                    })
                })
                .finally(() => {
                    this.setState({
                        isSaving: false
                    })
                })
        } else {
            ItemService.create(productModel)
                .then(async result => {
                    if (this.state.redirectToVariation) {
                        this.redirectToVariation(result.models)
                    } else {
                        if (this.state.isConfigWholesalePrice && this.renderPageMode === renderNewPageMode.WHOLESALE_PAGE) {
                            GSToast.commonUpdate()
                            this.redirectToWholesale(this.state.createdItemId)
                        } else if (this.state.isConfigConversionUnit && this.renderPageMode === renderNewPageMode.CONVERSION_UNIT_PAGE) {
                            GSToast.commonUpdate()
                            this.redirectToConversionUnit(this.state.createdItemId, result.models)
                        } else {
                            this.alertModal.openModal({
                                type: AlertModalType.ALERT_TYPE_SUCCESS,
                                messages: i18next.t("component.product.addNew.success.title"),
                                closeCallback: () => {
                                    if (this.state.redirectToCollection) {
                                        return this.redirectToCollection()
                                    }
                                    this.redirectToProductList()
                                }
                            })
                        }
                    }
                })
                .catch((e) => {
                    this.alertModal.openModal({
                        type: AlertModalType.ALERT_TYPE_DANGER,
                        messages: i18next.t("component.product.addNew.failed.title"),
                        closeCallback: () => {
                            this.setState({
                                isSaving: false
                            })
                        }
                    })
                    console.log('error when create product:', e)
                })
                .finally(() => {
                    this.setState({
                        isSaving: false
                    })
                })
        }
    }

    /**
     *
     * @param {ItemModel} productModel
     */
    async startEditItemTask(productModel) {
        productModel.cateId = this.state.linkToBeecowCateId
        if (this.state.linkToBeecowCategories.length > 0) { // -> update beecow categories
            productModel.categories = this.state.linkToBeecowCategories
        } else { // -> apply old categories
            productModel.categories = this.props.item.categories.map(cate => {
                return {
                    id: cate.id,
                    cateId: cate.cateId,
                    level: cate.level
                }
            })
        }
        // update inventory list
        if (this.state.onSaveStock) {
            productModel = this.updateStock(productModel)
        } else { // set change 0
            if (!productModel.lstInventory.length) {
                productModel.lstInventory = this.props.item.branches.map(branch => {
                    if (!branch.soldItem) {
                        branch.soldItem = 0
                    }

                    return {
                        branchId: branch.branchId,
                        stock: branch.totalItem,
                        orgStock: branch.totalItem,
                        sku: branch.sku,
                        soldStock: branch.soldItem,
                    }
                })
            }

            productModel.lstInventory.forEach(ivt => {
                ivt.inventoryStock = 0
                ivt.inventoryType = InventoryEnum.ACTIONS.CHANGE_STOCK
            })


            if (!this.state.onChangeImeiModal) {
                if (productModel.models.length === 0 && this.state.manageInventory === MANAGE_INVENTORY[1].value) {
                    productModel.itemModelCodeDTOS = await ItemService.getAllItemModelCode(+(window.location.pathname.split('/product/edit/').join('')))
                }

                if (productModel.models.length > 0 && this.state.manageInventory === MANAGE_INVENTORY[1].value) {
                    const allItemModelCode = await ItemService.getAllItemModelCode(+(window.location.pathname.split('/product/edit/').join('')))
                    productModel.models.map(model => {
                        model.itemModelCodeDTOS = allItemModelCode.filter(imc => imc.modelId === model.id)
                        return model;
                    })
                }
            }


        }
        // mark if has linked item
        productModel.hasLinkedShopeeItem = this.isHasLinkedProduct();
        // call api to save item
        let itemRes
        ItemService.update(productModel)
            .then(async createRes => { // => saved success
                itemRes = createRes
                if (this.state.isRemoveWholesalePrice || this.state.isRemoveConversionUnit) {
                    if (this.state.isRemoveWholesalePrice) {
                        const removeAllWholesale = await ItemService.deleteAllWholeSalePrices(this.itemId)
                    }
                    if (this.state.isRemoveConversionUnit) {
                        const removeAllConversionUnit = await ItemService.deleteAllConversionUnitList(this.itemId)
                    }
                } else if (this.state.isCheckRemoveWholesaleItem || this.state.isCheckRemoveConversionUnit) {
                    let variationRemoveList = this.state.variationRemoveList
                    if (variationRemoveList) {
                        const dataRemoveWholesale = {
                            itemId: this.itemId,
                            lstModelIdDeleted: variationRemoveList
                        }
                        const removeWholesalePricingByVars = await ItemService.deleteWholesalePricingByVariation(dataRemoveWholesale)
                        // BE check to remove conversion-unit
                        // const removeConversionUnitByVars = await ItemService.deleteConversionUnitByVariation(this.itemId, variationRemoveList)
                    }

                }

                //call api to save collection
                if (TokenUtils.hasAnyPackageFeatures([PACKAGE_FEATURE_CODES.FEATURE_0111])) {
                    const collectionRes = await ItemService.createCollectionForItemId(createRes.id, this.state.collectionList)
                }
                // redirect after saved
                // Redirect to Variation detail when click on edit variation (ignore success popup)
                if (this.state.redirectToVariation) {
                    return this.redirectToVariation(itemRes.models)
                }
                // Redirect to Shopee account
                if (this.state.directToShopeeAccountManagement) {
                    return this.refConfirmModal.openModal({
                        messages: i18next.t`page.product.haveNoShopeeAccountText`,
                        modalBtnCancel: i18next.t`common.btn.cancel`,
                        modalBtnOk: i18next.t`shopee.account.author.connect`,
                        okCallback: () => {
                            return this.setState({
                                onRedirect: true
                            }, () => RouteUtils.redirectWithoutReload(this.props, NAV_PATH.shopeeAccountManagement))
                        }
                    })
                }
                // Redirect to Shopee item when click on Shopee sync icon (ignore success popup)
                if (this.state.directToShopee) {
                    // show error if item has deposit
                    const hasDeposit = this.isHasDeposit(createRes)
                    if (hasDeposit) {
                        this.alertModal.openModal({
                            type: AlertInlineType.ERROR,
                            messages: i18next.t('page.product.create.shopee.doesnotSyncDeposit')
                        })
                        GSToast.commonUpdate()
                        return;
                    }
                    const isHasLinkedProduct = this.isHasLinkedProduct();
                    const isHasNewAccount = this.isHasNewShopeeAccount();
                    // If item has linked product AND new shopee account => Show pop to select sync mode before redirect
                    if (isHasLinkedProduct && isHasNewAccount) {
                        return this.setState({
                            isShowShopeeSyncTypeModal: true,
                            isSaving: false
                        })
                    }
                    // If has linked product only => Redirect to Shopee item edit page
                    if (isHasLinkedProduct) {
                        return this.setState({
                            onRedirect: true
                        }, () => RouteUtils.redirectWithoutReload(this.props, "/channel/shopee/edit_product/" + this.props.item.id));
                    }
                    // If has new account only => Redirect to Shopee new item page
                    if (isHasNewAccount) {
                        return this.setState({
                            onRedirect: true
                        }, () => RouteUtils.redirectWithoutReload(this.props, "/channel/shopee/product/" + this.props.item.id));
                    }
                }
                if (this.state.directToTiki && this.state.tikiStatus) {
                    return this.setState({
                        onRedirect: true
                    }, () => RouteUtils.linkTo(this.props, `${NAV_PATH.tikiEditProduct}/${this.props.item.id}`));
                } else if (this.state.directToTiki && !this.state.tikiStatus) {
                    return this.setState({
                        onRedirect: true
                    }, () => RouteUtils.linkTo(this.props, `${NAV_PATH.tikiProduct}/${this.props.item.id}`));
                }
                if (this.state.redirectToCollection) { // redirect when click on create new collection
                    return this.redirectToCollection()
                }
                if (this.state.shopeeStatus === true) {
                    this.compareVariationWithShopee(productModel);
                    this.setState({
                        afterSavedItem: itemRes
                    })
                } else {
                    if (this.state.isConfigWholesalePrice && this.renderPageMode === renderNewPageMode.WHOLESALE_PAGE) {
                        this.redirectToWholesale(this.state.createdItemId)
                    } else if (this.state.isConfigConversionUnit && this.renderPageMode === renderNewPageMode.CONVERSION_UNIT_PAGE) {
                        GSToast.commonUpdate()
                        this.redirectToConversionUnit(this.state.createdItemId, itemRes.models)
                    } else {
                        this.channel.postMessage(Constants.CHANNEL_PRODUCT_DETAIL + `-${this.props.match.params.itemId}`);
                        this.redirectToProduct(this.props.item.id) // redirect to  product when do nothing
                    }
                }
            }).catch((e) => {
            console.log(e)
            let errMsg
            if (e.response?.data?.message === 'error.error.item.outofstock') {
                errMsg = i18next.t('page.product.edit.failed.stock')
            } else if (e.response?.data?.detail === 'error.incomplete.transfer') {
                errMsg = i18next.t('page.product.detail.notice.notAllowUpdateVariationInCompletedTransfer')
            } else {
                errMsg = i18next.t("component.product.edit.failed.title")
            }
            // Show complete modal and hide saving status
            this.alertModal.openModal({
                type: AlertModalType.ALERT_TYPE_DANGER,
                messages: errMsg,
                closeCallback: () => {
                    this.setState({
                        isSaving: false
                    })
                    if (e.response && e.response.data.message === 'error.error.item.outofstock') {
                        this.redirectToProduct(this.props.item.id)
                    }
                }
            })
        })
            .finally(() => {
                this.setState({
                    isSaving: false
                })
            })
    }

    async handleOnSaveSubmit(event, errors, values) {
        if (!this.isCheckValidOnly) {
            this.setState({
                isSaving: true
            })
        }
        // if (this.state.isSaving) return
        let productModel = {
            categories: this.state.linkToBeecowCategories.length === 0 ? [{
                id: null,
                level: 1,
                cateId: this.OTHER_CATEGORY_ID_LVL1
            }, {id: null, level: 2, cateId: this.OTHER_CATEGORY_ID_LVL2}] : this.state.linkToBeecowCategories,
            name: "",
            cateId: this.state.linkToBeecowCateId !== this.OTHER_CATEGORY_ID_LVL2 ? this.state.linkToBeecowCateId : this.OTHER_CATEGORY_ID_LVL2,
            itemType: "BUSINESS_PRODUCT",
            currency: CurrencyUtils.getLocalStorageSymbol(),
            description: "",
            discount: "0",
            costPrice: 0,
            orgPrice: 0,
            newPrice: 0,
            totalComment: 0,
            totalLike: 0,
            images: [],
            totalItem: -1,
            shippingInfo: {"weight": "0", "width": "0", "length": "0", "height": "0"},
            parentSku: "",
            models: [],
            seoTitle: values.seoTitle || undefined,
            seoDescription: values.seoDescription ? values.seoDescription : undefined,
            seoUrl: values.seoUrl ? ItemUtils.changeNameToLink(values.seoUrl) : undefined,
            seoKeywords: values.seoKeywords ? values.seoKeywords : undefined,
            priority: null,
            taxId: null,
            quantityChanged: false,
            bcoin: 0,
            isSelfDelivery: false,
            showOutOfStock: true,
            barcode: null,
            isHideStock: false,
            inventoryManageType: MANAGE_INVENTORY[0].value,
            conversionUnitId: this.state.unitId
        }
        // check valid
        const isAllFieldValidRes = await this.isAllFieldValid(values)
        if (!isAllFieldValidRes | errors.length > 0) {
            this.setState({
                isValid: false,
                isSaving: false
            })
            this.isCheckValidOnly = false
            return
        }
        this.setState({
            isValid: true
        })
        // just using for checking
        if (this.isCheckValidOnly === true) {
            this.isCheckValidOnly = false
            return
        }
        // if update case
        if (this.props.mode === ProductFormEditorMode.EDIT) {
            productModel = {
                ...this.props.item,
                storeId: CredentialUtils.getStoreId(),
                seoTitle: values.seoTitle ? values.seoTitle : undefined,
                seoDescription: values.seoDescription ? values.seoDescription : undefined,
                seoUrl: values.seoUrl ? ItemUtils.changeNameToLink(values.seoUrl) : undefined,
                seoKeywords: values.seoKeywords ? values.seoKeywords : undefined
            }
        }
        //apply platform for item
        productModel = {
            ...productModel,
            onApp: this.state.onApp || false,
            onWeb: this.state.onWeb || false,
            inStore: this.state.inStore || false,
            inGosocial: this.state.inGosocial || false
        };
        // upload image
        let prodBasicInfo = values
        productModel.priority = prodBasicInfo.productPriority
        productModel.taxId = this.state.defaultVAT.value
        productModel.enabledListing = this.state.enabledListing
        let saveSub = this.uploadImageToServer()
            .then(values => {
                // swap with main image
                let mainIndex = this.state.prodImageMain
                let orgImageArr = this.props.item ? this.props.item.images : []
                // get already exists image
                for (let orgImageIndex in orgImageArr) {
                    if (!orgImageArr[orgImageIndex].id) {
                        delete orgImageArr[orgImageIndex]
                    } else {
                        orgImageArr[orgImageIndex] = {
                            imageId: orgImageArr[orgImageIndex].imageId,
                            imageUUID: orgImageArr[orgImageIndex].imageUUID,
                            urlPrefix: orgImageArr[orgImageIndex].urlPrefix,
                            extension: orgImageArr[orgImageIndex].extension
                        }
                    }
                }
                // get new image just uploaded
                let imageArr = []
                if (values.length > 0) {
                    for (let i = 0; i < values.length; i++) {
                        imageArr.push(this.formatImageData(values[i]));
                    }
                }
                // merge image already exists to new image
                let finalImageArr = [...orgImageArr, ...imageArr]
                // swap main image to [0]
                let tempImage0 = finalImageArr[0]
                let tempImage3 = finalImageArr[mainIndex]
                finalImageArr[0] = tempImage3
                finalImageArr[mainIndex] = tempImage0
                productModel.models = this.createProductModelRequest()
                // re-check image position
                if (productModel.models.length !== 0) { // has model
                    // productModel.hasModel = true
                    productModel.totalItem = 0
                    for (let model of productModel.models) {
                        productModel.totalItem += model.totalItem
                    }
                    productModel.quantityChanged = true
                    productModel.barcode = null
                    delete productModel.orgPrice
                    delete productModel.newPrice
                    delete productModel.discount
                    delete productModel.totalItem
                    delete productModel.costPrice
                } else {
                    productModel.costPrice = this.checkSymbolInput(this.state.symbolCode, this.state.prodCostPrice)
                    productModel.barcode = prodBasicInfo.barcode || (this.props.mode === ProductFormEditorMode.EDIT ? this.props.item.id : null)
                    productModel.orgPrice = this.checkSymbolInput(this.state.symbolCode, this.state.prodPrice)
                    let newPrice = this.checkSymbolInput(this.state.symbolCode, this.state.prodDiscountPrice);
                    //BH-5173 if new price is empty, set to default value is org price
                    //BH-15756 allow newPrice = 0
                    if (newPrice !== 0 && !newPrice) {
                        newPrice = productModel.orgPrice;
                    }
                    productModel.newPrice = newPrice;
                    productModel.discount = PricingUtils.calculateDiscount(productModel.orgPrice, productModel.newPrice)
                }
                productModel.name = prodBasicInfo.productName;
                // productModel.cateId = this.refProdCategory.current.getCateId()
                productModel.description = this.formatAfterEditByGSEditor(prodBasicInfo.productDescription);
                productModel.images = finalImageArr;
                productModel.showOutOfStock = this.state.showOutOfStock;
                productModel.isHideStock = this.state.isHideStock;
                productModel.inventoryManageType = this.state.manageInventory;
                productModel.conversionUnitId = this.state.unitId;

                if (productModel.models.length === 0 && this.state.manageInventory === MANAGE_INVENTORY[1].value) {
                    productModel.itemModelCodeDTOS = this.state.itemModelCodeDTOS;
                }

                if (productModel.models.length === 0 && productModel.totalItem !== this.refProdStock.current.getValue()) {
                    productModel.totalItem = this.refProdStock.current.getValue()
                    productModel.quantityChanged = true
                }
                productModel.shippingInfo = {
                    weight: this.refProdWeight.current.getValue(),
                    height: this.refProdHeight.current.getValue(),
                    length: this.refProdLength.current.getValue(),
                    width: this.refProdWidth.current.getValue()
                }
                productModel.parentSku = prodBasicInfo.productSKU
                if (this.props.mode === ProductFormEditorMode.EDIT) {
                    delete productModel.commissionPercent
                    delete productModel.commissionAmount
                    delete productModel.hasCommission
                    delete productModel.hasModel
                    delete productModel.createdDate
                    delete productModel.deleted
                    delete productModel.lastModifiedDate
                    delete productModel.quantityChangedDate
                    delete productModel.remainTime
                    delete productModel.reviewStatus
                    delete productModel.itemScore
                    delete productModel.typeScore
                    delete productModel.soldItem
                    delete productModel.totalSoldItem
                    if (productModel.bhStatus === 'ERROR') {
                        productModel.bhStatus = 'ACTIVE'
                    } else {
                        if (this.state.isActive) {
                            productModel.bhStatus = 'ACTIVE'
                        } else {
                            productModel.bhStatus = 'INACTIVE'
                        }
                    }
                }
                // CHECK CATEGORY
                return storeService.getStoreInfo(CredentialUtils.getStoreId())
            })
            .then(storeResult => {
                if (storeResult.categoryIds.includes(this.OTHER_CATEGORY_ID_LVL1)) {
                    return new Promise(resolve => resolve('alreadyHasOtherCategory'))
                } else {
                    return storeService.updateStorefrontInfo({
                        id: storeResult.id,
                        categoryIds: [...storeResult.categoryIds, this.OTHER_CATEGORY_ID_LVL1]
                    })
                }
            })
            .then(cateResult => {
                // ADD NEW PRODUCT
                if (this.props.mode === ProductFormEditorMode.ADD_NEW) {
                    this.startCreateNewItemTask(productModel)
                } else { // UPDATE PRODUCT
                    this.startEditItemTask(productModel)
                }
            })
            .catch((e) => {
                console.log(e)
                this.alertModal.openModal({
                    type: AlertModalType.ALERT_TYPE_DANGER,
                    messages: i18next.t("component.product.edit.failed.title"),
                    closeCallback: () => {
                        this.setState({
                            isSaving: false
                        })
                    }
                })
            })

    }

    compareVariationWithShopee(productModel) {
        const {id, models} = productModel;
        const modelsRequest = models.map(model => ({
            id: model.id,
            name: model.name,
            label: model.label,
        }));
        const request = {bcItemId: id, bcModels: modelsRequest};
        shopeeService.compareBcItemVariationsWithShopeeItemVariations(request)
            .then(responses => {
                const notMatched = responses.find(response => response.matchingStatusKey === "variation.match.not.ok");
                if (notMatched) {
                    const {id} = productModel;
                    shopeeService.markItemLinkError({bcItemIds: [id], hasLinkErrorStatus: true});
                    this.setState({isModalSave: true});
                } else {
                    if (this.state.isConfigWholesalePrice && this.renderPageMode === renderNewPageMode.WHOLESALE_PAGE) {
                        this.redirectToWholesale(this.state.createdItemId)
                    } else if (this.state.isConfigConversionUnit && this.renderPageMode === renderNewPageMode.CONVERSION_UNIT_PAGE) {
                        GSToast.commonUpdate()
                        this.redirectToConversionUnit(this.state.createdItemId, productModel.models)
                    } else {
                        this.redirectToProduct(this.props.item.id) // redirect to  product when do nothing
                    }
                }
            })
            .catch((_e) => {
                console.log(_e)
                this.alertModal.openModal({
                    type: AlertModalType.ALERT_TYPE_DANGER,
                    messages: i18next.t("component.product.edit.failed.title"),
                    closeCallback: () => {
                        this.setState({
                            isSaving: false
                        })
                    }
                })
            })
    }

    /**
     * Update stock for PRODUCT HAS NO VARIATIONS
     * In this case, this.state.stockDataRow only has one row. First row is updated stock for product
     * @param {ItemModel} item
     * @returns {ItemModel}
     */
    updateStock(item) {
        /**
         * @type {ItemModel}
         */
        const itemRes = item
        /**
         * @type {*|UpdateStockDataRowModel}
         */
        const updatedDataRow = this.state.stockDataRow[0]
        itemRes.lstInventory = ItemUtils.mapInventoryToRequest(updatedDataRow.lstInventory)
        return itemRes
    }

    onCollectionFetchingComplete() {
        this.setState({
            isCollectionFetchingComplete: true
        })
    }

    onCollectionChange(collectionList) {
        this.setState({
            collectionList: collectionList
        })
        this.onFormChange();
    }

    redirectToCollection() {
        this.setState({
            onRedirect: true
        }, () => {
            RouteUtils.linkTo(this.props, NAV_PATH.collectionCreate + '/PRODUCT')
        })
    }

    redirectToCollectionWithSave() {
        this.setState({
            redirectToCollection: true
        }, () => {
            this.onSave()
        })
    }

    redirectToProductList() {
        this.setState({
            onRedirect: true
        })
    }

    redirectToProduct(id) {
        this.setState({
            onRedirect: true
        }, () => {
            RouteUtils.redirectWithoutReload(this.props, NAV_PATH.productEdit + '/' + id)
        })
    }

    redirectToWholesale(id) {
        this.setState({
            onRedirect: true
        }, () => {
            if (this.state.isRemoveWholesalePrice || this.state.totalWholeSaleList === 0) {
                RouteUtils.linkTo(this.props, NAV_PATH.productWholeSaleCreate + '/' + id);
            } else {
                RouteUtils.linkTo(this.props, NAV_PATH.productWholeSaleEdit + '/' + id);
            }
        })
    }

    redirectToConversionUnit(id, hasModels) {
        let filterModel = this.handleModelWithoutDeposit(hasModels)

        this.setState({
            onRedirect: true
        }, () => {
            if (this.state.isRemoveConversionUnit || this.state.totalConversionUnitItem === 0) {
                if (filterModel.length === 0) {
                    RouteUtils.linkTo(this.props, NAV_PATH.productConversionUnitCreate + '/' + id);
                } else {
                    RouteUtils.redirectWithoutReloadWithData(this.props, NAV_PATH.productConversionUnitVariationCreate + '/' + id, {
                        listModelItemId: filterModel
                    });
                }
            } else {
                if (filterModel.length === 0) {
                    RouteUtils.linkTo(this.props, NAV_PATH.productConversionUnitEdit + '/' + id);
                } else {
                    RouteUtils.redirectWithoutReloadWithData(this.props, NAV_PATH.productConversionUnitVariationEdit + '/' + id, {
                        listModelItemId: filterModel
                    });
                }
            }
        })
    }

    redirectToVariation(models) {
        const variation = models.find(m => m.orgName === this.state.redirectToVariation)
        if (variation) {
            this.setState({
                onRedirect: true
            }, () => {
                RouteUtils.redirectWithoutReload(this.props, `/product/${variation.itemId}/variation-detail/${variation.id}/edit`)
            })
        }
    }

    async isAllFieldValid(frmValues) {
        // image
        const tState = this.state
        const isImageValid = () => {
            if (tState.prodImageList.length < this.IMAGE_MIN_LENGTH || tState.prodImageList.length > this.IMAGE_MAX_LENGTH) {
                this.setState({
                    isValidImageAmount: false
                })
                return false
            }
            return true
        }
        const isBarcodeValid = async () => {
            const barcode = frmValues.barcode
            // ignore check if empty barcode OR barcode is item id OR has variation
            if (!barcode || (this.props.mode === ProductFormEditorMode.EDIT && barcode === this.props.item.id) || this.state.varLength + this.state.depositLength > 0) return true
            const itemBarcodeList = await ItemService.checkExistedItemByBarcodeList([barcode])
            if (itemBarcodeList.length === 0) { // not found any item has this barcode -> valid
                return true
            } else {
                // found matched barcode item but itself -> still valid
                if (this.props.mode === ProductFormEditorMode.EDIT
                    && itemBarcodeList[0].itemId == this.props.item.id
                ) {
                    return true
                } else { // found matched barcode but it's another item -> invalid
                    this.setState({
                        isValidBarcode: false
                    })
                    return false
                }
            }
        }
        const isBarcodeValidRes = await isBarcodeValid();
        const isVariationValidRes = await this.refProdVariation.current.isValid();
        const isDepositValidRes = await this.refProdDeposit.current.isValid();
        const isSEOUrlValidRes = this.refSEOUrl.current && await this.refSEOUrl.current.isValid()

        if (!this.refProdWidth.current.isValid()
            | !this.refProdLength.current.isValid()
            | !this.refProdWeight.current.isValid()
            | !this.refProdHeight.current.isValid()
            | (this.refProdCostPrice.current !== null && !this.refProdCostPrice.current.isValid())
            | (this.refProdPrice.current !== null && !this.refProdPrice.current.isValid())
            | (this.refProdDiscount.current !== null && !this.refProdDiscount.current.isValid())
            | !isVariationValidRes
            | !isDepositValidRes
            | !isImageValid()
            | !isBarcodeValidRes
            | !isSEOUrlValidRes
        ) {
            return false
        }

        return true
    }

    onSelectMainImage(index) {
        this.setState({
            prodImageMain: index
        })
        this.onFormChange();
    }

    onImageUploaded(files) {
        if (!Array.isArray(files)) {
            files = [...files]
        }
        //filter wrong extension
        files = files.filter(file => {
            if ([ImageUploadType.JPEG, ImageUploadType.PNG, ImageUploadType.GIF].includes(file.type)) { // => correct
                return true
            } else {
                GSToast.error(i18next.t("component.product.addNew.images.wrongFileType", {
                    fileName: file.name
                }))
                return false
            }
        })
        // check if has image over limited size
        const overSizeFiles = files.filter((file) => file.size / 1024 / 1024 > this.IMAGE_MAX_SIZE_BY_MB)
        if (overSizeFiles.length > 0) {
            for (const f of overSizeFiles) {
                GSToast.error(i18next.t("component.product.addNew.images.maximumSize", {
                    fileName: f.name,
                    size: this.IMAGE_MAX_SIZE_BY_MB
                }))
            }
        }
        // filter size
        files = files.filter((file) => file.size / 1024 / 1024 <= this.IMAGE_MAX_SIZE_BY_MB)
        // filter length
        let tArr = [...this.state.prodImageList, ...files].slice(0, this.IMAGE_MAX_LENGTH)
        this.setState({
            prodImageList: [...tArr],
            isValidImageAmount: tArr.length >= this.IMAGE_MIN_LENGTH && tArr.length <= this.IMAGE_MAX_LENGTH
        })
        this.onFormChange();
    }

    onRemoveImage(index) {
        this.refProdVariation.current.onRemoveImage(index)
        this.state.prodImageList.splice(index, 1)
        let prodImageMain = this.state.prodImageMain
        if (this.state.prodImageList.length === 0) {
            prodImageMain = -1
        } else {
            if (prodImageMain === index) {
                prodImageMain = 0;
            } else {
                if (prodImageMain > index) {
                    prodImageMain -= 1
                }
            }
        }
        this.setState({
            prodImageList: this.state.prodImageList,
            prodImageMain: prodImageMain,
            isValidImageAmount: this.state.prodImageList.length >= this.IMAGE_MIN_LENGTH && this.state.prodImageList.length <= this.IMAGE_MAX_LENGTH
        })
        this.onFormChange();
    }

    isMainImage(index) {
        if (this.state.prodImageMain === -1) {
            if (index === 0) {
                this.setState({
                    prodImageMain: 0
                })
                return true
            }
        } else {
            if (this.state.prodImageMain === index) return true
            return false
        }
    }

    onImageDrop(files) {
        this.onImageUploaded(files)
    }

    checkSymbolInput(symbol, value) {
        if (symbol === Constants.CURRENCY.VND.SYMBOL) {
            return parseInt(value)
        } else {
            return parseFloat(value).toFixed(2)
        }
    }
}

class ImageView extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            isSetMainCoverShow: false,
            o9n: 1,
            imageObj: null
        }
        this.onRemoveCallback = this.props.onRemoveCallback
        this.onSelectCallback = this.props.onSelectCallback
        this.onMouseEnterImageView = this.onMouseEnterImageView.bind(this)
        this.onMouseLeaveImageView = this.onMouseLeaveImageView.bind(this)
        this.onClickSetMain = this.onClickSetMain.bind(this)
        this.createImageObject = this.createImageObject.bind(this)
    }

    componentDidMount() {
        this.createImageObject()
    }

    onMouseEnterImageView() {
        if (this.props.isMain) return
        this.setState({
            isSetMainCoverShow: true
        })
    }

    onMouseLeaveImageView() {
        // if (this.props.isMain) return
        this.setState({
            isSetMainCoverShow: false
        })
    }

    onClickSetMain() {
    }

    createImageObject() {
        let src = this.props.src
        if (!!src.imageId || !!src.imageUUID) {
            this.setState({
                imageObj: ImageUtils.getImageFromImageModel(src) // src.urlPrefix + '/' + src.imageId + '.jpg'
            })
        } else {
            ImageUtils.getOrientation(this.props.src, (o9n => {
                this.setState({
                    o9n: o9n,
                    imageObj: URL.createObjectURL(this.props.src)
                })
            }))
        }
    }

    render() {
        return (
            <div
                className={'image-view image-widget__image-item ' + (this.props.isMain ? 'image-widget__image-item--main' : '')}
                onMouseEnter={this.onMouseEnterImageView}
                onMouseLeave={this.onMouseLeaveImageView}
            >
                <a className="image-widget__btn-remove" onClick={() => {
                    this.onRemoveCallback(this.props.arrIndex)
                }}>
                    <FontAwesomeIcon icon="times-circle">
                    </FontAwesomeIcon>
                </a>
                <img className={"photo " + 'photo--o9n-' + this.state.o9n}
                     width="137px"
                     height="137px"
                     src={this.state.imageObj}
                />
                <div hidden={!this.props.isMain} className="image-widget__main-cover">
                    <Trans i18nKey="component.product.addNew.imageView.mainPhoto">
                        Main photo
                    </Trans>
                </div>
                <div className="image-widget__set-main-cover" hidden={!this.state.isSetMainCoverShow}>
                    <UikButton transparent
                               className="image-widget__btn-set-main"
                               onClick={() => this.onSelectCallback(this.props.arrIndex)}>
                        <Trans i18nKey="component.product.addNew.imageView.setMain">
                            Set Main
                        </Trans>
                    </UikButton>
                </div>
            </div>
        )
    }
}

ProductFormEditor.defaultProps = {
    branchList: [],
    commissionList: []
}
ProductFormEditor.contextType = ProductContext.context
ProductFormEditor.propTypes = {
    itemId: any,
    commissionList: array,
    ProductModelKey: any,
    item: any,
    mode: any,
    collectionList: array,
    collectionDefaultList: array,
    branchList: arrayOf(shape({
        address: string,
        branchStatus: string,
        branchType: string,
        city: string,
        code: string,
        createdBy: string,
        createdDate: string,
        district: string,
        email: string,
        expiryDate: string,
        id: number,
        isDefault: bool,
        lastModifiedBy: string,
        lastModifiedDate: string,
        name: string,
        phoneNumberFirst: string,
        phoneNumberSecond: string,
        status: bool,
        storeId: number,
        ward: string
    })),
    shopeeItemList: array
}
export default ProductFormEditor
