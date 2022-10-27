import React from "react";
import {UikSelect, UikTag} from '../../../@uik'
import AvFieldCountable from "../../../components/shared/form/CountableAvField/AvFieldCountable";
import {AvField, AvForm} from 'availity-reactstrap-validation';
import '../../../../sass/ui/_gswidget.sass'
import '../../../../sass/ui/_gsfrm.sass'
import '../ProductFormEditor/ImageView.sass'
import Label from "reactstrap/es/Label";
import './VariationDetail.sass'
import CryStrapInput, {CurrencySymbol} from "../../../components/shared/form/CryStrapInput/CryStrapInput";
import {Trans} from "react-i18next";
import i18next from "../../../config/i18n";
import AlertModal from "../../../components/shared/AlertModal/AlertModal";
import {Link} from "react-router-dom";
import ConfirmModal from "../../../components/shared/ConfirmModal/ConfirmModal";
import GSContentHeader from "../../../components/layout/contentHeader/GSContentHeader";
import GSContentBody from "../../../components/layout/contentBody/GSContentBody";
import GSContentContainer from "../../../components/layout/contentContainer/GSContentContainer";
import {calculateDiscount} from "../../../utils/pricing";
import {RouteUtils} from "../../../utils/route";
import GSTrans from "../../../components/shared/GSTrans/GSTrans";
import PropTypes from "prop-types";
import {NAV_PATH} from "../../../components/layout/navigation/Navigation";
import GSEditor from "../../../components/shared/GSEditor/GSEditor";
import GSButton from "../../../components/shared/GSButton/GSButton";
import PrivateComponent from "../../../components/shared/PrivateComponent/PrivateComponent";
import {PACKAGE_FEATURE_CODES} from "../../../config/package-features";
import GSWidget from "../../../components/shared/form/GSWidget/GSWidget";
import GSWidgetHeader from "../../../components/shared/form/GSWidget/GSWidgetHeader";
import GSWidgetContent from "../../../components/shared/form/GSWidget/GSWidgetContent";
import VariationSelectionList from "./VariationSelectionList/VariationSelectionList";
import GSModalUploadImage from "../../../components/shared/GSModal/GSModalUploadImage/GSModalUploadImage";
import ImageBox from "../../../components/shared/GSModal/GSModalUploadImage/ImageBox";
import {ItemService} from "../../../services/ItemService";
import {GSToast} from "../../../utils/gs-toast";
import {ImageUtils} from "../../../utils/image";
import GSImg from "../../../components/shared/GSImg/GSImg";
import AvCustomCheckbox from "../../../components/shared/AvCustomCheckbox/AvCustomCheckbox";
import GSFakeLink from "../../../components/shared/GSFakeLink/GSFakeLink";
import Constants from "../../../config/Constant";
import {cPromise} from "../../../utils/promise";
import storeService from "../../../services/StoreService";
import ProductMultipleBranchStockEditorModal
    from "../ProductFormEditor/MultipleBranchStockEditorModal/ProductMultipleBranchStockEditorModal";
import {ProductFormEditorMode} from "../ProductFormEditor/ProductFormEditor";
import LoadingScreen from "../../../components/shared/LoadingScreen/LoadingScreen";
import {InventoryEnum} from "../InventoryList/InventoryEnum";
import _, {debounce} from "lodash"
import {FormValidate} from "../../../config/form-validate";
import VariationTranslateModal from "./VariationSelectionList/VariationTranslateModal";
import {ItemUtils} from "../../../utils/item-utils";
import {CredentialUtils} from "../../../utils/credential";
import affiliateService from "../../../services/AffiliateService";
import GSAlertBox from "../../../components/shared/GSAlertBox/GSAlertBox";
import ManagedInventoryModal from "../ProductFormEditor/managedInventoryModal/ManagedInventoryModal";
import AvFieldCurrency from "../../../components/shared/AvFieldCurrency/AvFieldCurrency";
import {CurrencyUtils} from "../../../utils/number-format";

const ObjectKey = {
    ID: "id",
    NAME: "name",
    IMAGE: "image",
    BARCODE: "barcode",
    DESCRIPTION: "description",
    DISCOUNT: "discount",
    NEW_PRICE: "newPrice",
    ORG_PRICE: "orgPrice",
    REMAINING_ITEM: "remainingItem",
    SKU: "sku",
    SOLD_ITEM: "soldItem",
    TOTAL_ITEM: "totalItem",
    VARIATION_VALUE: "variationValue",
    VERSION_NAME: "versionName",
    IMAGE_POSITION: "imagePosition",
    RANK: "rank",
    ARR_LABEL: "arrLabel",
    USE_PRODUCT_DESCRIPTION: 'useProductDescription',
    STATUS: 'status',
    ORG_NAME: "orgName",
    UPDATE_TOCK: "updateStock",
    ITEMMODELCODEDTOS:"itemModelCodeDTOS",
}

const STATUS = {
    ACTIVE: "ACTIVE",
    DEACTIVE: "DEACTIVE"
}

export default class VariationDetail extends React.Component {
    DEPOSIT_KEY = '[d3p0s1t]'
    DEPOSIT_100_KEY = '[100P3rc3nt]'
    DEPOSIT_NAME = 'DEPOSIT'

    constructor(props) {
        super(props)
        this.isReSeller = CredentialUtils.ROLE.RESELLER.isReSeller()
        this.disabledUpdatePrice = !CredentialUtils.ROLE.RESELLER.allowUpdatedPrice() && this.isReSeller
        this.state = {
            isValidImageAmount: true,
            isSaving: false,
            isFetching: true,
            isSavingFailed: false,
            onRedirect: false,
            isActive: false,
            isValid: true,
            variationImageDefault: {},
            total_variation: 0,
            images: [],
            imgList: [],
            isChange: false,
            isStockChange: false,
            notDisposit100: false,
            isShowUpdateStock: false,
            onSaveStock: false,
            stockDataRow: [],
            stockUpdateMode: '',
            branchList: [],
            filterBranchList: [],
            selectedBranch: null,
            toggleUpdateStockModal: false,
            validBarcode: true,
            commissionList: []
        }
        // actions
        this.handleOnSaveSubmit = this.handleOnSaveSubmit.bind(this)
        this.isAllFieldValid = this.isAllFieldValid.bind(this)
        this.handleOnCancel = this.handleOnCancel.bind(this)
        this.defaultValue = this.defaultValue.bind(this)
        this.onChangePrice = this.onChangePrice.bind(this)
        this.onModelUploadImageShow = this.onModelUploadImageShow.bind(this);
        this.changeImageForVariation = this.changeImageForVariation.bind(this);
        this.switchVariationAction = this.switchVariationAction.bind(this);
        this.convertListToMap = this.convertListToMap.bind(this);
        this.fetchDataForComponent = this.fetchDataForComponent.bind(this);
        this.getItemByItemId = this.getItemByItemId.bind(this);
        this.modifiedModel = this.modifiedModel.bind(this);
        this.defaultItemValue = this.defaultItemValue.bind(this);
        this.defaultImageEmpty = this.defaultImageEmpty.bind(this);
        this.findImgForVariation = this.findImgForVariation.bind(this);
        this.getDescription = this.getDescription.bind(this);
        this.changeCheckboxUseDescription = this.changeCheckboxUseDescription.bind(this);
        this.handleOnChangeStatus = this.handleOnChangeStatus.bind(this);
        this.redirectToVariation = this.redirectToVariation.bind(this);
        this.setStateAfterModelChange = this.setStateAfterModelChange.bind(this);
        this.setEditAction = this.setEditAction.bind(this);
        this.setGSEditAction = this.setGSEditAction.bind(this);
        this.onCloseUpdateStockModal = this.onCloseUpdateStockModal.bind(this);
        this.onSaveStock = this.onSaveStock.bind(this);
        this.calculateRemaining = this.calculateRemaining.bind(this);
        this.getActiveBranch = this.getActiveBranch.bind(this);
        this.handleSelectBranch = this.handleSelectBranch.bind(this);
        this.isValidBarcode = this.isValidBarcode.bind(this);
        this.onBlurBarcode = this.onBlurBarcode.bind(this);
        this.getDefaultBranchValue = this.getDefaultBranchValue.bind(this);
        this.isHasCommission = this.isHasCommission.bind(this);
        this.renderCommissionAlert = this.renderCommissionAlert.bind(this);
        this.getDataForUpdateStockManagedInventory = this.getDataForUpdateStockManagedInventory.bind(this);
        this.handleManagedInventoryCallback = this.handleManagedInventoryCallback.bind(this);

        // this.ref
        this.refVariationPrice = React.createRef()
        this.refVariationStock = React.createRef()
        this.refVariationDiscount = React.createRef()
    }

    componentDidMount() {
        this.fetchDataForComponent();
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.state.branchList && this.state.selectedBranch && prevState.selectedBranch !== this.state.selectedBranch) {
            const filterBranchList = this.state.branchList.filter(branch => branch.id === this.state.selectedBranch.value.id)

            this.setState({
                filterBranchList
            })
        }
    }

    isHasCommission() {
        return this.state.commissionList.length > 0
    }

    onBlurBarcode(e) {
        const barcode = e.currentTarget.value
        this.setState({
            validBarcode:  true
        })
    }

    isValidBarcode(barcode) {
        return new Promise((resolve, reject) => {
            if (!barcode) {
                resolve(true)
                return
            }
            ItemService.checkExistedItemByBarcodeList([barcode])
                .then(existedBarcodeList => {
                    const invalidBarcodeList = existedBarcodeList.filter(exBarcode => {
                        const id = exBarcode.combinedId
                        const variation = this.state.model.itemId + '-' + this.state.model.id === id? this.state.model:undefined
                        if (variation && variation.barcode === exBarcode.barcode) {
                            return false // -> valid => not check
                        }
                        return true // -> invalid
                    })
                    resolve(invalidBarcodeList.length === 0)
                })
        })
    }

    onCloseUpdateStockModal() {
        this.setState({
            isShowUpdateStock: false
        })
    }

    fetchDataForComponent() {
        const {itemId, modelItemId} = this.props.match.params
        Promise.all([
            this.getItemByItemId(itemId, modelItemId),
            this.getActiveBranch()
        ])
            .finally(() => this.setState({isFetching: false}));

        // ========================
        //  RESELLER PROCESSING
        // ========================
        if (CredentialUtils.ROLE.RESELLER.isReSeller()) {
            affiliateService.getCommissionListByItemId(itemId)
                .then(commissionList => {
                    this.setState({
                        commissionList: commissionList
                    })
                })
        }
    }

    convertListToMap(list, key) {
        let result = list.reduce(function (map, obj) {
            map[obj[key]] = obj;
            return map;
        }, new Map());
        return result
    }

    modifiedModel(model) {
        if (model.label) {
            let arrLabel = model.label.split('|');
            let arrValue = model.orgName.split('|');
            arrLabel.map((label, idx) => {
                model[label] = arrValue[idx];
            })
            model.arrLabel = arrLabel;
            model[ObjectKey.BARCODE] = model.barcode;
        }
        return model;
    }

    switchVariationAction(variation) {
        this.setState({
            onRedirect: true
        }, () => {
            RouteUtils.redirectWithoutReload(this.props, `${NAV_PATH.product}/${this.state.itemId}${NAV_PATH.variationDetail}/${variation.id}/edit`);
        })
    }

    getItemByItemId(itemId, modelItemId) {
        return ItemService.fetch(itemId)
            .then(async result => {
                let mapVariations = this.convertListToMap(result.models, ObjectKey.ID)
                let mapImages = this.convertListToMap(result.images, ObjectKey.RANK)
                let model = mapVariations[modelItemId];
                let image_position = model[ObjectKey.IMAGE_POSITION] != undefined ? model[ObjectKey.IMAGE_POSITION] : null;


                const inventoryRes = await ItemService.getInventory(itemId)

                const inventoryList = inventoryRes.lstInventory
                result.models.forEach(model => {
                    const inventory = inventoryList.find(i => i.modelId === model.id)
                    if (inventory) {
                        model.soldItem = inventory.soldItem
                    }
                    model.remaining = model.totalItem
                })

                this.setState({
                    itemId: itemId,
                    modelItemId: modelItemId,
                    item: result,
                    modelsMap: mapVariations,
                    modelsList: result.models,
                    model: this.modifiedModel(model),
                    images: mapImages,
                    image: mapImages[image_position] ? mapImages[image_position] : this.defaultImageEmpty(),
                    image_position: image_position,
                    total_variation: result.models.length,
                    imgList: result.images
                }, () => {
                    this.setStateAfterModelChange();
                })
            })
            .catch(() => {
                this.setState({
                    onRedirect: true
                }, () => {
                    RouteUtils.redirectWithoutReloadWithData(this.props, NAV_PATH.notFound);
                })
            })
    }

    getActiveBranch() {
        this.pmGetStoreBranchList = cPromise(storeService.getActiveStoreBranches())
        return this.pmGetStoreBranchList.promise
            .then(branchList => {
                this.setState({
                    branchList: branchList,
                    selectedBranch: {
                        value: branchList[0],
                        label: branchList[0].name
                    }
                })
            })
    }

    setStateAfterModelChange() {
        let isUseProductDescription = this.state.model[ObjectKey.USE_PRODUCT_DESCRIPTION] != undefined ? this.state.model[ObjectKey.USE_PRODUCT_DESCRIPTION] : true;
        let totalItem = this.defaultValue(ObjectKey.TOTAL_ITEM, 0);
        let soldItem = this.defaultValue(ObjectKey.SOLD_ITEM, 0);
        let remaining = this.defaultValue('remaining', 0);
        this.setState({
            variationPrice: this.defaultValue(ObjectKey.ORG_PRICE, 0),
            variationDiscountPrice: this.defaultValue(ObjectKey.NEW_PRICE, 0),
            useProductDescription: isUseProductDescription,
            description: this.getDescription(isUseProductDescription),
            isActive: this.defaultValue(ObjectKey.STATUS, STATUS.ACTIVE) === STATUS.ACTIVE,
            soldItem: soldItem,
            totalItem: totalItem,
            remainingItem: remaining,
            notDisposit100: this.state.model[this.DEPOSIT_KEY] != undefined && this.defaultValue(this.DEPOSIT_KEY, '') !== this.DEPOSIT_100_KEY
        })
    }
    checkMaxSellingPriceForWholesale(data){
        ItemService.checkMaxSellingPriceForWholesale(data)
            .then(result => {
                if(result){
                    let data = result.find(r => r.modelId === this.state.model.id )
                    if(data) {
                        if(data.status === 0){
                            this.setState({
                                isErrorValidateSellingPrice: true,
                                errorValidSellingPrice: i18next.t('component.wholesalePrice.error.wholesale_price_higher_sale_price')
                            })
                        }else{
                            this.setState({
                                isErrorValidateSellingPrice: false,
                                errorValidSellingPrice:''
                            })
                        }
                    }
                }
            })
            .catch(err => {
                console.log(err)
            })
    }
    handleProdDiscountPrice = debounce((price) => {
        // e.preventDefault()
        let data = {
            lstData:[
                {
                    itemId: parseFloat(this.state.itemId),
                    modelId: this.state.model.id,
                    newPrice: parseFloat(price)
                }
            ]
        }
        let min_value = 1000
        let max_value= this.state.variationPrice
        if(!price || price === undefined || price === null) {
            this.setState({
                isErrorValidateSellingPrice: true,
                errorValidSellingPrice: i18next.t('component.wholesalePrice.error.please_input_price_first')
            })
            return
        }
        console.log('data:', data)
        if(!(parseFloat(price) >= min_value && parseFloat(price) <= max_value))return
        this.checkMaxSellingPriceForWholesale(data)

    }, [300])

    handleOnChangeStatus() {
        this.setState({
            isSaving: true
        })
        let status = this.state.isActive ? STATUS.DEACTIVE : STATUS.ACTIVE;
        ItemService.updateStatusModelItem(this.state.modelItemId, status)
            .then(() => {
                let model = this.state.model;
                model[ObjectKey.STATUS] = status;
                let mapModel = this.state.modelsMap;
                mapModel[this.state.modelItemId] = model;
                this.setState({
                    isActive: !this.state.isActive,
                    isSaving: false,
                    model: model,
                    modelsMap: mapModel
                })
            }).catch(() => {
            GSToast.commonError();
        })
    }

    getDescription(isUseProductDescription) {
        return isUseProductDescription ? this.state.item.description : this.defaultValue(ObjectKey.DESCRIPTION, '');
    }

    changeCheckboxUseDescription(target) {
        this.setState(
            {
                isChange: true,
                useProductDescription: target.currentTarget.value,
                description: this.getDescription(target.currentTarget.value)
            }
        )
    }


    changeImageForVariation(img) {
        this.setState({
            image: img.imgObj === null ? this.defaultImageEmpty() : img.imgObj,
            image_position: img.index,
            isChange: true
        })
        if (img.images) {
            let mapImages = this.convertListToMap(img.images, ObjectKey.RANK);
            this.setState({
                images: mapImages,
                imgList: img.images
            })
        }
    }

    findImgForVariation(position) {
        return this.state.images[position] ? this.state.images[position] : this.defaultImageEmpty();
    }

    defaultImageEmpty() {
        let img = ImageUtils.mapImageUrlToImageModel(require('../../../../public/assets/images/default_image2.png'));
        img.imageId = -99999;
        return img;
    }

    setEditAction(model) {
        this.setState({
            isChange: true
        })
    }

    setGSEditAction(model) {
        this.setState({
            isChange: true,
            description: model
        })
    }

    renderCommissionAlert() {
        const rateArray = this.state.commissionList.map(commission => commission.rate)
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
                    Commission rate: <strong className="color-red">0%</strong>. You will <strong>NOT</strong> earn commission by selling this product.
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

    renderHeader() {

        const renderTag = () => {
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

        }
        return (
            <GSContentHeader className="page-toolbar">
                <div>
                    <Link to={NAV_PATH.productEdit + `/${this.state.itemId}`} className="color-gray mb-2 d-block">
                        &#8592; {this.defaultItemValue(ObjectKey.NAME, '')}
                    </Link>
                    <h5 className="gs-page-title">
                        {renderTag()}
                        {
                            <span>{this.defaultValue(ObjectKey.ARR_LABEL, []).filter(label => this.defaultValue(label, '') != this.DEPOSIT_100_KEY)
                                .map((label, _) => {
                                    return this.defaultValue(label, '')
                                }, []).join(' - ')}</span>
                        }
                    </h5>
                </div>

                {this.renderHeaderBtnNew()}
            </GSContentHeader>
        )
    }

    renderHeaderMobile() {
        return (
            this.renderHeaderBtnNew()
        );
    }

    renderHeaderBtnNew() {
        return (<div className='gss-content-header--action-btn sticky'>
            <div className='gss-content-header--action-btn--group'>

                {/*BTN EDIT*/}
                <span className={this.isHasCommission()? 'disabled':''}>
                    <VariationTranslateModal modelItemId={this.state.modelItemId} dataLanguage={this.state.item}/>
                </span>

                {/*BTN SAVE*/}
                <GSButton success className="btn-save" marginRight style={{marginLeft: 'auto'}} disabled={this.state.errorValidSellingPrice}
                          onClick={() => this.refBtnSubmitForm.click()}>
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
                {this.state.isActive ?
                    <GSButton warning outline marginLeft hidden={this.state.isSaving}
                              onClick={this.handleOnChangeStatus}>
                        <Trans i18nKey="component.product.edit.toolbar.status.deactivate">
                            Cancel
                        </Trans>
                    </GSButton>
                    : <GSButton info outline marginLeft hidden={this.state.isSaving}
                                onClick={this.handleOnChangeStatus}>
                        <Trans i18nKey="component.product.edit.toolbar.status.activate">
                            Cancel
                        </Trans>
                    </GSButton>
                }
            </div>
        </div>);
    }

    getDataForUpdateStock() {
        let lstInventory = []
        const firstRow = this.state.stockDataRow[0]

        if (firstRow) {
            lstInventory = firstRow.lstInventory
        } else {
            lstInventory = this.state.item.lstInventory
            if (!lstInventory || lstInventory.length === 0) {
                lstInventory = ItemUtils.mapBranchesToLstInventory(this.state.branchList)
            }
        }

        const newLstInventory = lstInventory.map(branch => ({
            ...branch,
            newStock: branch.stock
        }))

        return [{
            id: this.defaultValue('id', null),
            name: this.state.model.orgName.split('|'),
            lstInventory: newLstInventory,
            label: this.state.model.label.split('|')
        }]
    }

    onSaveStock(stockValue, mode, dataRows) {
        const clonedDataRows = _.cloneDeep(dataRows)

        this.setState({
            // isSaving: true,
            toggleUpdateStockModal: false,
            isStockChange: true,
            isChange: true,
            onSaveStock: true,
            stockDataRow: clonedDataRows,
            stockUpdateMode: mode,
        })
    }


    calculateRemaining() {
        if (this.state.stockDataRow[0]) {
            return this.state.stockDataRow[0].newStock
        }
        return this.state.model.remaining
    }

    handleSelectBranch(e) {
        if (this.state.isStockChange) {
            this.refConfirmModal.openModal({
                messages: i18next.t('component.product.addNew.cancelHint'),
                okCallback: () => {
                    this.setState({
                        selectedBranch: e,
                        isStockChange: false,
                    })
                }
            })
        } else {
            this.setState({selectedBranch: e})
        }
    }

    getDataForUpdateStockManagedInventory(managedInventoryList) {
        let dataItemModelCodeList = []

        managedInventoryList.forEach(managedInventory=>{
            managedInventory.serial.forEach(code=>{
                    let findCode = this.state.model.itemModelCodeDTOS.find(findCode =>findCode.code === code)
                    dataItemModelCodeList.push({
                        id:findCode?.id,
                        itemId:findCode?.itemId,
                        branchId: managedInventory.branchId,
                        code: code,
                        status: Constants.ITEM_MODE_CODE_STATUS.AVAILABLE
                    })
            })
        })

        const branch = this.state.model.branches.find(branch => branch.branchId === this.state.selectedBranch.value.id)
        const inventoryStock = managedInventoryList.find(branch=>branch.branchId === this.state.selectedBranch.value.id)
        let lstInventory = {
            inventoryType: InventoryEnum.ACTIONS.SET_STOCK,
            inventoryStock: inventoryStock.serial.length,
            inventoryActionType: InventoryEnum.ACTION_TYPES.FROM_UPDATE_AT_VARIATION_DETAIL,
            inventoryCurrent: branch.totalItem
        }

        this.state.model.itemModelCodeDTOS = dataItemModelCodeList
        this.state.model.lstInventory = lstInventory
        this.setState({
            model:this.state.model,
            isChange: true
        })
    }

    handleManagedInventoryCallback() {
        this.setState({
            isOpenManagedInventoryModal: false
        })
    }


    render() {
        return (
            <>
                {this.state.isFetching && <LoadingScreen/>}
                <ManagedInventoryModal

                    isOpenModal={this.state.isOpenManagedInventoryModal}
                    callback={this.handleManagedInventoryCallback}
                    branchList={this.state.filterBranchList}
                    dataTable={this.getDataForUpdateStockManagedInventory}
                    indexVariation={this.state?.item?.models?.findIndex(index => index.id == this.props.match.params.modelItemId)}
                    models={this.state?.item?.models}
                    mode={ProductFormEditorMode.EDIT}
                    modeVariation={true}
                    variationTable={this.state.model}
                    prodName={this.state?.item?.name}
                    itemId={this.props.match.params}
                />

                {this.state.item && <GSContentContainer confirmWhenRedirect confirmWhen={!this.state.onRedirect}
                                                        className="variation-detail-form-page"
                                                        isSaving={this.state.isSaving}>
                    <ProductMultipleBranchStockEditorModal isOpen={this.state.toggleUpdateStockModal}
                                                           branchList={this.state.filterBranchList}
                                                           selected={this.state.selectedBranch ? [this.state.selectedBranch.value.id] : []}
                                                           variationLength={1}
                                                           dataTable={this.getDataForUpdateStock()}
                                                           mode={ProductFormEditorMode.EDIT}
                                                           item={this.state.item}
                                                           onCancel={() => this.setState({toggleUpdateStockModal: false})}
                                                           onSave={this.onSaveStock}
                                                           prodName={this.state.item.name}
                    />

                    {this.renderHeader()}
                    <GSContentBody size={GSContentBody.size.MAX}>
                        {this.renderHeaderMobile()}
                        <AvForm onSubmit={this.handleOnSaveSubmit} autoComplete="off">
                            <button type="submit" ref={(el) => this.refBtnSubmitForm = el} hidden/>

                            {!this.state.isValid &&
                            <div
                                className="mt-3 alert alert-danger variation-detail-form-page__alert variation-detail-form-page__alert--error"
                                role="alert">
                                <Trans i18nKey="component.product.edit.invalidate"/>
                            </div>
                            }
                            {this.state.commissionList.length > 0 && this.renderCommissionAlert()}
                            <section className="variation-detail-form-page__widget-wrapper">



                                <section
                                    className="variation-detail-form-page__widget-col variation-detail-form-page__widget-col--n1">

                                    {/*PRODUCT INFO*/}
                                    <GSWidget>
                                        <GSWidgetHeader>
                                            <Trans i18nKey="component.product.variation.productVersion.title">
                                                Product Version
                                            </Trans>
                                        </GSWidgetHeader>
                                        <GSWidgetContent>

                                            <Label for={'productName'} className="gs-frm-control__title">
                                                <Trans i18nKey="component.product.variation.productVersion.name">
                                                    Product Version Name
                                                </Trans>
                                            </Label>
                                            <AvFieldCountable
                                                name={'variationName'}
                                                type={'text'}
                                                isRequired={true}
                                                minLength={0}
                                                maxLength={100}
                                                value={this.defaultValue(ObjectKey.VERSION_NAME, this.defaultItemValue(ObjectKey.NAME, ''))}
                                                tabIndex={1}
                                                onChange={this.setEditAction}
                                                className={this.isHasCommission()? 'disabled':''}
                                            />
                                            <div className="row">
                                                {
                                                    this.defaultValue(ObjectKey.ARR_LABEL, [])
                                                        .filter(label => this.defaultValue(label, '') != this.DEPOSIT_100_KEY)
                                                        .map((label, idx, arr) => {
                                                            let colomn = 3
                                                            if (arr.length <= 4) {
                                                                colomn = 12 / arr.length;
                                                            }
                                                            return (
                                                                <div key={`${label}-${idx}`}
                                                                     className={`col-lg-${colomn} col-md-${colomn} col-sm-12 pl-0 pr-2`}>
                                                                    <Label for={`${label}`}
                                                                           className="gs-frm-control__title">
                                                                        {label == this.DEPOSIT_KEY ? this.DEPOSIT_NAME : label}
                                                                    </Label>
                                                                    <AvField
                                                                        className={'gs-atm--disable'}
                                                                        name={label}
                                                                        value={
                                                                            this.defaultValue(label, '')
                                                                        }
                                                                    />
                                                                </div>
                                                            )
                                                        })
                                                }
                                                {/*Color*/}
                                            </div>
                                            <div className={'des-header'}>
                                                <Label for={'productDescription'} className="gs-frm-control__title">
                                                    <Trans
                                                        i18nKey="component.product.addNew.productInformation.description">
                                                        Description
                                                    </Trans>
                                                </Label>
                                                {
                                                    this.state.useProductDescription != undefined &&
                                                    <AvCustomCheckbox
                                                        className={'check-b'}
                                                        name={'useProductDescription'}
                                                        color="blue"
                                                        label={i18next.t("component.variation.productDescription.label")}
                                                        value={this.state.useProductDescription}
                                                        onChange={this.changeCheckboxUseDescription}
                                                    />
                                                }
                                            </div>
                                            <div
                                                className={this.state.useProductDescription ? 'gs-atm--disable' : 'gs-atm--show'}>
                                                {
                                                    this.state.description != undefined && <GSEditor
                                                        name={'description'}
                                                        isRequired={false}
                                                        maxLength={100000}
                                                        value={this.state.description}
                                                        tabIndex={2}
                                                        onChange={this.setGSEditAction}

                                                    />
                                                }
                                            </div>
                                        </GSWidgetContent>
                                    </GSWidget>

                                    {/*IMAGE*/}
                                    <GSWidget>
                                        <GSWidgetHeader className={'widget__header widget__header--text-align-right'}>
                                            <Trans i18nKey="component.product.addNew.images.title">
                                                Images
                                            </Trans>
                                        </GSWidgetHeader>
                                        <GSWidgetContent>
                                            <div className="image-widget__container">
                                                {this.state.image &&
                                                <ImageBox
                                                    arrIndex={1}
                                                    src={this.state.image}
                                                    formModal={false}
                                                    onShowModalCallback={this.onModelUploadImageShow}
                                                />
                                                }
                                            </div>
                                        </GSWidgetContent>
                                    </GSWidget>

                                    {/*PRICING*/}
                                    <GSWidget>
                                        <GSWidgetHeader>
                                            <Trans i18nKey="page.product.create.pricing">
                                                Pricing
                                            </Trans>
                                        </GSWidgetHeader>
                                        <GSWidgetContent>
                                            <div className="row">
                                                {/*Price*/}
                                                <div
                                                    className={"col-sm-12 pl-0 pr-2" + this.state.notDisposit100 !== undefined && this.state.notDisposit100 ? 'col-lg-12 col-md-12' : 'col-lg-6 col-md-6'}>
                                                    <Label for={'productPrice'} className="gs-frm-control__title">
                                                        <Trans
                                                            i18nKey="component.product.addNew.pricingAndInventory.price">
                                                            Price
                                                        </Trans>
                                                    </Label>
                                                    {
                                                        this.state?.variationPrice === 0  ?
                                                        <CryStrapInput
                                                            ref={this.refVariationPrice}
                                                            name={'productPrice'}
                                                            thousandSeparator=","
                                                            unit={this.state.item.currency}
                                                            default_value={
                                                                this.state?.variationPrice
                                                            }
                                                            min_value={0}
                                                            max_value={Constants.VALIDATIONS.PRODUCT.MAX_PRICE}
                                                            on_change_callback={this.onChangePrice}
                                                            disable={this.disabledUpdatePrice}
                                                            precision={CurrencyUtils.isCurrencyInput(this.state.item.currency) && '2'}
                                                            decimalScale={CurrencyUtils.isCurrencyInput(this.state.item.currency) && 2}
                                                        /> : this.state.variationPrice &&
                                                            <CryStrapInput
                                                                ref={this.refVariationPrice}
                                                                name={'productPrice'}
                                                                thousandSeparator=","
                                                                unit={this.state.item.currency}
                                                                default_value={
                                                                    this.state?.variationPrice
                                                                }
                                                                min_value={0}
                                                                max_value={Constants.VALIDATIONS.PRODUCT.MAX_PRICE}
                                                                on_change_callback={this.onChangePrice}
                                                                disable={this.disabledUpdatePrice}
                                                                precision={CurrencyUtils.isCurrencyInput(this.state.item.currency) && '2'}
                                                                decimalScale={CurrencyUtils.isCurrencyInput(this.state.item.currency) && 2}
                                                            />
                                                    }

                                                </div>
                                                {/*Discount*/}
                                                {
                                                    !this.state.notDisposit100 &&
                                                    <div className="col-lg-6 col-md-6 col-sm-12 pl-2 pr-0">
                                                        <Label for={'productDiscountPrice'}
                                                               className="gs-frm-control__title">
                                                            <Trans
                                                                i18nKey="component.product.addNew.pricingAndInventory.discountPrice">
                                                                Discount Price
                                                            </Trans>
                                                        </Label>
                                                        <CryStrapInput
                                                            ref={this.refVariationDiscount}
                                                            id={'productDiscountPrice'}
                                                            name={'productDiscountPrice'}
                                                            thousandSeparator=","
                                                            key={this.state.variationPrice}
                                                            unit={this.state.item.currency}
                                                            default_value={
                                                                this.state.variationDiscountPrice
                                                            }
                                                            min_value={0}
                                                            max_value={this.state.variationPrice}
                                                            custom_err={this.state.errorValidSellingPrice}
                                                            on_change_callback={(price) => {
                                                                this.handleProdDiscountPrice(price)
                                                                this.setState({
                                                                    variationDiscountPrice: price,
                                                                    isChange: true
                                                                })
                                                            }}
                                                            required={false}
                                                            disable={this.disabledUpdatePrice}
                                                            precision={CurrencyUtils.isCurrencyInput(this.state.item.currency) && '2'}
                                                            decimalScale={CurrencyUtils.isCurrencyInput(this.state.item.currency) && 2}
                                                        />
                                                        <small className="text-danger">{this.state.errorValidSellingPrice}</small>
                                                    </div>
                                                }
                                            </div>
                                        </GSWidgetContent>
                                    </GSWidget>
                                </section>
                                <section
                                    className="variation-detail-form-page__widget-col variation-detail-form-page__widget-col--n2">
                                    {/*INFOR PRODUCT*/}
                                    <GSWidget className="gs-widget">
                                        <GSWidgetContent
                                            className={'product-info'}
                                        >
                                            <GSImg className={'product-default__avatar'}
                                                   src={this.state.imgList[0]}
                                            />
                                            <div className="ml-2 justify-content-between product-default__info-wrapper">
                                                <h5 className="product-name">{this.defaultItemValue(ObjectKey.NAME, '')}</h5>
                                                <div className="variation-number">{this.state.total_variation} <Trans
                                                    i18nKey="component.variationDetail.selection.title">
                                                    Variation
                                                </Trans></div>
                                            </div>
                                        </GSWidgetContent>
                                    </GSWidget>

                                    {/*BRANCH*/}
                                    {this.state.selectedBranch && this.state.branchList.length && <GSWidget>
                                        <GSWidgetHeader>
                                            <Trans i18nKey="component.variationDetail.branch.title">
                                                Branch
                                            </Trans>
                                        </GSWidgetHeader>
                                        <GSWidgetContent
                                            className={'branch-list'}
                                        >
                                            <UikSelect
                                                className='w-100'
                                                defaultValue={this.state.branchList[0]}
                                                options={this.state.branchList.map(branch => ({
                                                    value: branch,
                                                    label: branch.name
                                                }))}
                                                value={[this.state.selectedBranch]}
                                                onChange={e => this.handleSelectBranch(e)}
                                            />
                                        </GSWidgetContent>
                                    </GSWidget>}

                                    {/*VARIATION*/}
                                    <GSWidget>
                                        <GSWidgetHeader>
                                            <Trans i18nKey="component.variationDetail.selection.title">
                                                Variation
                                            </Trans>
                                        </GSWidgetHeader>
                                        <GSWidgetContent
                                            className={'variation-body-scroll'}
                                        >
                                            <PrivateComponent wrapperDisplay={"block"}
                                                              hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.FEATURE_0111]}>
                                                {
                                                    this.state.modelsList
                                                    &&
                                                    <VariationSelectionList
                                                        className={'selection'}
                                                        variationList={
                                                            this.state.modelsList
                                                        }
                                                        variationMap={
                                                            this.state.modelsMap
                                                        }
                                                        imageList={
                                                            this.state.images
                                                        }
                                                        switchVariationAction={this.switchVariationAction}
                                                        selected={this.state.modelItemId}
                                                        isChange={this.state.isChange}
                                                    />
                                                }

                                            </PrivateComponent>
                                        </GSWidgetContent>
                                    </GSWidget>

                                    {/*WAREHOUSING*/}
                                    <GSWidget>
                                        {console.log(this.state.model)}
                                        <GSWidgetHeader rightEl={
                                            <GSFakeLink
                                                onClick={this.state?.item?.inventoryManageType == "IMEI_SERIAL_NUMBER" && 
                                                (this.state.model['[d3p0s1t]'] === "[100P3rc3nt]" || !this.state.model['[d3p0s1t]'])
                                                    ?
                                                    () => this.setState({isOpenManagedInventoryModal: true}):
                                                    () => this.setState({toggleUpdateStockModal: true})}>
                                                <GSTrans t="page.product.create.updateStockModal.title"/>
                                            </GSFakeLink>
                                        }>
                                            <GSTrans t="page.product.create.warehousing"/>
                                        </GSWidgetHeader>
                                        <GSWidgetContent>

                                            {/*SKU*/}
                                            <AvField
                                                onChange={this.setEditAction}
                                                className={'cur-input'}
                                                value={
                                                    this.getDefaultBranchValue(ObjectKey.SKU, '')
                                                }
                                                name={'variationSKU'}
                                                label="SKU"
                                                validate={{
                                                    maxLength: {
                                                        value: 100,
                                                        errorMessage: i18next.t("common.validation.char.max.length", {x: 100})
                                                    }
                                                }}
                                            />
                                            {/*BARCODE*/}
                                            <AvField
                                                key={this.state.model.barcode}
                                                className={'cur-input'}
                                                value={
                                                    this.defaultValue(ObjectKey.BARCODE, '')
                                                }
                                                name="barcode"
                                                label="BARCODE"
                                                validate={{
                                                    ...FormValidate.maxLength(48),
                                                    ...FormValidate.async((value, ctx, input, cb) => {
                                                        if (this.state.validBarcode) {
                                                            cb(true)
                                                        } else {
                                                            cb(i18next.t`page.product.create.existedBarcode`)
                                                        }
                                                    })
                                                }}
                                                onBlur={this.onBlurBarcode}
                                            />
                                            {/*REMAINING*/}
                                            <Label for={'remaining'} className="gs-frm-control__title">
                                                <GSTrans
                                                    t={"component.product.addNew.pricingAndInventory.remainingStock"}/>
                                            </Label>
                                            {
                                                this.state.remainingItem != undefined &&
                                                <CryStrapInput
                                                    className={'gs-atm--disable'}
                                                    name={'soldItem'}
                                                    thousandSeparator=","
                                                    precision="0"
                                                    unit={CurrencySymbol.NONE}
                                                    default_value={this.getDefaultBranchValue(ObjectKey.TOTAL_ITEM, 0)}
                                                    key={this.getDefaultBranchValue(ObjectKey.TOTAL_ITEM, 0)}
                                                />
                                            }
                                            {/*SOLD COUNT*/}
                                            <Label for={'soldItem'} className="gs-frm-control__title">
                                                <GSTrans t={"component.product.addNew.pricingAndInventory.soldCount"}/>
                                            </Label>
                                            {
                                                this.state.soldItem != undefined &&
                                                <CryStrapInput
                                                    className={'gs-atm--disable'}
                                                    name={'soldItem'}
                                                    thousandSeparator=","
                                                    precision="0"
                                                    unit={CurrencySymbol.NONE}
                                                    default_value={this.getDefaultBranchValue(ObjectKey.SOLD_ITEM, 0)}
                                                    key={this.state.selectedBranch}
                                                />
                                            }
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
                    {this.state.imgList.length > 0 &&
                    <GSModalUploadImage ref={(el) => {
                        this.refUploadImageModal = el
                    }}
                                        chooseImageAction={this.changeImageForVariation}
                                        imgChoose={this.state.images[this.state.image_position]}
                                        imgList={this.state.imgList}
                                        callbackMode={'innerChange'}
                                        itemId={this.state.itemId}
                    />}
                </GSContentContainer>}
            </>
        )
    }

    onModelUploadImageShow() {
        this.refUploadImageModal.openModal({
            imgChooseIndex: this.state.image_position,
            imgDefaultIndex: this.state.image_position
        })
    }

    onChangePrice(price) {
        // check discount price, if it is 0, set price to discount
        this.setState({
            variationPrice: price,
            isChange: true
        })

    }

    defaultValue(key, defaultV) {
        if (!this.state.model) return defaultV
        let value = this.state.model[key] ? this.state.model[key] : defaultV

        if (key === ObjectKey.BARCODE && !this.state.model[key]) {
            return this.state.model.itemId + '-' + this.state.model.id
        }

        return value;
    }

    defaultItemValue(key, defaultV) {
        if (!this.state.item) return defaultV
        return this.state.item[key] ? this.state.item[key] : defaultV
    }

    getDefaultBranchValue(key, defaultV) {
        if (!this.state.model) return defaultV

        const branch = this.state.model.branches.find(branch => branch.branchId === this.state.selectedBranch?.value.id)

        if (!branch) {
            return defaultV
        }

        let value = branch[key] ? branch[key] : defaultV

        return value;
    }

    handleOnCancel() {
        RouteUtils.redirectWithoutReload(this.props, NAV_PATH.productEdit + '/' + this.state.itemId)
    }

    redirectToVariation(itemId, itemModelId) {
        this.setState({
            onRedirect: true
        }, () => {
            RouteUtils.redirectWithoutReload(this.props, `${NAV_PATH.product}/${itemId}${NAV_PATH.variationDetail}/${itemModelId}/edit`);
        })

    }

    async handleOnSaveSubmit(event, errors, values) {
        this.setState({
            isValid: true,
            isSaving: true
        })
        // // check valid
        const isAllFieldValid = await this.isAllFieldValid(values)
        if (!isAllFieldValid | errors.length > 0) {
            this.setState({
                isValid: false,
                isSaving: false
            })
            return
        }
        this.setState({
            isValid: true,
            isSaving: true
        })
        /**
         * @type {ModelItemModel}
         */



        let modelItem = this.state.model;
        const finalBarcode = values.barcode || (modelItem.itemId + '-' + modelItem.id)
        modelItem[ObjectKey.BARCODE] = finalBarcode
        modelItem[ObjectKey.VERSION_NAME] = values.variationName;
        modelItem[ObjectKey.UPDATE_TOCK] = modelItem[ObjectKey.TOTAL_ITEM];
        modelItem[ObjectKey.TOTAL_ITEM] = modelItem[ObjectKey.TOTAL_ITEM];
        modelItem[ObjectKey.ORG_PRICE] = this.state.variationPrice;
        const orgPrice = this.state.variationPrice;

        let newPrice = this.state.variationDiscountPrice;
        //BH-5173 if new price empty, set to default value is org price
        if (!newPrice) {
            newPrice = orgPrice;
        }
        modelItem[ObjectKey.NEW_PRICE] = !this.state.notDisposit100 ? newPrice : orgPrice;
        modelItem[ObjectKey.IMAGE_POSITION] = this.state.image_position;
        modelItem.modelId = this.state.modelItemId;
        modelItem[ObjectKey.DESCRIPTION] = values.description;
        modelItem[ObjectKey.USE_PRODUCT_DESCRIPTION] = values.description === this.state.description && this.state.useProductDescription;
        modelItem[ObjectKey.NAME] = modelItem.orgName;

        const itemModelCode = await ItemService.getAllItemModelCode(this.props.match.params.itemId)

        modelItem[ObjectKey.ITEMMODELCODEDTOS] = modelItem.itemModelCodeDTOS.length === 0
            ? itemModelCode.filter(item=>item.itemModelId === `${this.props.match.params.itemId}-${this.props.match.params.modelItemId}`) : modelItem.itemModelCodeDTOS


        try {
            let updatedInventory = {
                branchId: this.state.selectedBranch.value.id,
                sku: values.variationSKU,
            }
            let updatedInventoryHasIMEI = {
                branchId: this.state.selectedBranch.value.id,
                sku: values.variationSKU,
            }

            if (this.state.onSaveStock) {
                const updatedBranch = this.state.stockDataRow[0].lstInventory.find(branch => branch.branchId === this.state.selectedBranch.value.id)

                if (updatedBranch) {
                    modelItem.inventoryType = this.state.stockUpdateMode.toUpperCase()
                    modelItem.actionType = 'FROM_UPDATE_AT_VARIATION_DETAIL'
                    updatedInventory = {
                        ...updatedInventory,
                        inventoryType: this.state.stockUpdateMode.toUpperCase(),
                        inventoryStock: updatedBranch.newStock,
                        inventoryActionType: InventoryEnum.ACTION_TYPES.FROM_UPDATE_AT_VARIATION_DETAIL
                    }
                }

                const currentBranch = this.state.model.branches.find(branch => branch.branchId === this.state.selectedBranch.value.id)

                if (currentBranch) {
                    updatedInventory = {
                        ...updatedInventory,
                        inventoryCurrent: currentBranch.totalItem,
                    }
                }
            }
            if (this.state?.item?.inventoryManageType == "IMEI_SERIAL_NUMBER"){
                updatedInventoryHasIMEI = {
                    ...updatedInventoryHasIMEI,
                    ...this.state.model.lstInventory,
                }
            }
            modelItem.lstInventory = this.state?.item?.inventoryManageType == "IMEI_SERIAL_NUMBER" 
            && (this.state.model['[d3p0s1t]'] === "[100P3rc3nt]" || !this.state.model['[d3p0s1t]']) ? [updatedInventoryHasIMEI] : [updatedInventory]

            this.setState(state=>({
                model: {
                    ...state.model,
                    barcode: values.barcode
                }
            }))


            await ItemService.updateModelItem(modelItem)

            this.setState(state=>({
                model: {
                    ...state.model,
                    barcode: finalBarcode
                }
            }))

            GSToast.success('toast.update.success', true)
            this.fetchDataForComponent()
            this.setState({
                isStockChange: false,
                isChange: false,
            })
        } catch (e) {
            if (e.response && (
                e.response.data.message === 'error.error.item.outofstock'
                || e.response.data.message === 'error.out.of.stock'
            )) {
                GSToast.error('page.product.edit.failed.stock', true)
            } else {
                GSToast.commonError();
            }
        } finally {
            this.setState({
                isSaving: false,
            })
        }
    }

    /**
     * Update inventory for variation
     * @param {ModelItemModel} modelItem
     * @returns {Promise | Promise<unknown>}
     */
    updateStock(modelItem) {
        /**
         * @type {UpdateStockRequestBodyModel}
         */
        let requestBody = {}

        requestBody.lstInventory = this.state.stockDataRow.map(row => {
            /**
             * @type {UpdateStockRequestBodyInventoryModel}
             */
            let inventory = {}
            // set id
            inventory.itemId = modelItem.itemId
            inventory.modelId = modelItem.id

            if (this.state.stockUpdateMode.toUpperCase() === 'CHANGE') {
                return {
                    ...inventory,
                    type: 'CHANGE',
                    stock: row.newStock - row.stock
                }
            }

            if (this.state.stockUpdateMode.toUpperCase() === 'SET') {
                return {
                    ...inventory,
                    type: 'SET',
                    currentStock: row.stock,
                    stock: row.newStock
                }
            }

        })


        return ItemService.updateInventory(requestBody)
    }

    async isAllFieldValid(values) {
        if ((this.refVariationPrice.current !== null && !this.refVariationPrice.current.isValid())
            | (this.refVariationDiscount.current !== null && !this.refVariationDiscount.current.isValid())
            | (this.refVariationStock.current !== null && !this.refVariationStock.current.isValid())) {
            return false
        }

        // check barcode
        const validBarcode = await  this.isValidBarcode(values.barcode)
        this.setState({
            validBarcode
        })

        return validBarcode
    }
}

VariationDetail.propTypes = {
    mode: PropTypes.any,

}

VariationDetail.propTypes = {
    mode: PropTypes.any
}
