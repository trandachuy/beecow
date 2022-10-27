import React from 'react';
import {UikButton, UikCheckbox, UikContentTitle, UikSelect} from '../../../../@uik';
import './ShopeeSyncEditProduct.sass';
import GSContentContainer from "../../../../components/layout/contentContainer/GSContentContainer";
import GSContentHeader from "../../../../components/layout/contentHeader/GSContentHeader";
import {Trans} from "react-i18next";
import {Breadcrumb, BreadcrumbItem, Modal, ModalBody, ModalFooter, ModalHeader} from 'reactstrap';
import GSContentBody from "../../../../components/layout/contentBody/GSContentBody";
import {ItemService} from "../../../../services/ItemService";
import AvFieldCountable from "../../../../components/shared/form/CountableAvField/AvFieldCountable";
import {AvField, AvForm} from 'availity-reactstrap-validation';
import Label from "reactstrap/es/Label";
import ImageUploader, {ImageUploadType} from "../../../../components/shared/form/ImageUploader/ImageUploader";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import Dropzone from "react-dropzone";
import AlertInline from "../../../../components/shared/AlertInline/AlertInline";
import i18next from "../../../../config/i18n";
import CryStrapInput, {CurrencySymbol} from "../../../../components/shared/form/CryStrapInput/CryStrapInput";
import shopeeService from '../../../../services/ShopeeService';
import DropdownTree from '../../../../components/shared/DropdownTree/DropdownTree';
import {ImageUtils} from "../../../../utils/image";
import ShopeeEditProductVariantsTable from "./VariantsTable/ShopeeEditProductVariantsTable_1";
import Constants from "../../../../config/Constant";
import {GSToast} from "../../../../utils/gs-toast";
import Loading, {LoadingStyle} from "../../../../components/shared/Loading/Loading";
import {CurrencyUtils} from "../../../../utils/number-format";
import mediaService, {MediaServiceDomain} from "../../../../services/MediaService";
import LoadingScreen from "../../../../components/shared/LoadingScreen/LoadingScreen";
import {NAV_PATH} from '../../../../components/layout/navigation/Navigation';
import {RouteUtils} from '../../../../utils/route';
import GSButton from "../../../../components/shared/GSButton/GSButton";
import GSTrans from "../../../../components/shared/GSTrans/GSTrans";
import moment from 'moment';
import DateRangePicker from 'react-bootstrap-daterangepicker';
import GSWidget from "../../../../components/shared/form/GSWidget/GSWidget";
import GSWidgetHeader from "../../../../components/shared/form/GSWidget/GSWidgetHeader";
import GSWidgetHeaderSubtitle from "../../../../components/shared/form/GSWidget/GSWidgetHeaderSubtitle";
import GSWidgetContent from "../../../../components/shared/form/GSWidget/GSWidgetContent";
import GSTooltip, {GSTooltipIcon} from "../../../../components/shared/GSTooltip/GSTooltip";
import {ShopeeLogisticUtils} from "./shopee-logistic-utils";
import {StringUtils} from "../../../../utils/string";
import {FileUtils} from "../../../../utils/file";
import _ from 'lodash';
import ShopeeEditProductAttributeSelector
    , {BRAND_ATTR_ID} from "./ShopeeEditProductAttributeSelector/ShopeeEditProductAttributeSelector";

export const ProductModelKey = {
    NAME: "name",
    CATE_ID: "cateId",
    ITEM_TYPE: "itemType",
    CURRENCY: "currency",
    DESCRIPTION: "description",
    DISCOUNT: "discount",
    ORG_PRICE: "orgPrice",
    NEW_PRICE: "newPrice",
    TOTAL_COMMENT: "totalComment",
    TOTAL_LIKE: "totalLike",
    IMAGES: "images",
    TOTAL_ITEM: "totalItem",
    SHIPPING_INFO: "shippingInfo",
    CATEGORIES: "categories",
    PARENT_SKU: "parentSku",
    MODELS: "models",
    QUANTITY_CHANGED: "quantityChanged",
    BCOIN: "bcoin",
    IS_SELF_DELIVERY: "isSelfDelivery",
}

export const DATE_RANGE_LOCATE_CONFIG = {
    UI_DATE_FORMAT: "DD-MM-YYYY",
    SERVER_DATE_FORMAT: "YYYY-MM-DD",
    format: "DD-MM-YYYY",
    applyLabel: i18next.t("component.order.date.range.apply"),
    cancelLabel: i18next.t("component.order.date.range.cancel")
}

export const PRODUCT_SYNC_PART = {
    NAME: 'name',
    PRICE: 'price',
    DESCRIPTION: 'description',
    STOCK: 'stock'
}

class ShopeeSyncEditProduct extends React.Component {
    _isMounted = false

    constructor(props) {
        super(props);

        this.IMAGE_MAX_LENGTH = 9
        this.IMAGE_MAX_SIZE_BY_MB = 2


        this.state = {
            itemId: props.match.params.itemId,
            product: {},
            isValidImageAmount: true,
            isValidImageType: true,
            isSaving: false,
            productImages: [],
            prodImageMain: 0,
            shippingInfo:{},
            categories: [],
            logistics: [],
            logisticsSelected: [],
            isFetching: true,
            isCollapsed: false,
            attributesMandatory: [],
            attributesNonMandatory: [],
            attributesSelected:[],
            isFetchingAttributes: false,
            isShowAllAttributes: false,
            categoryId : '',
            submitCategoryError: '',
            submitLogisticError: '',
            isValidForm : true,
            redirectPageConfirm: true,
            shopeeShopList: [],
            shopeeSelectedShopId: undefined,
            shopeeSelectedItem: undefined,
            shopeeSelectedShop: undefined,
            syncBySelected: false,
            syncPartList: [],
            enabledStock: false,
            id: null,
            storeId: null,
            name: null,
            description: null,
            price: null,
            stock: null,
            gosellProduct: undefined
        }

        this.lstSpecialAttr = [];
        // this.ref
        this.refSubmitFrom = React.createRef();
        this.refProdPrice = React.createRef();
        this.refProdDiscount = React.createRef();
        this.refProdStock = React.createRef();
        this.refProdWeight = React.createRef();
        this.refProdLength = React.createRef();
        this.refProdWidth = React.createRef();
        this.refProdHeight = React.createRef();
        this.refProdCategory = React.createRef();
        this.refProdVariation = React.createRef();
        this.refAttributeSelector = React.createRef();


        this.toggleMoreInfo = this.toggleMoreInfo.bind(this);
        this.onSelectCategory = this.onSelectCategory.bind(this);
        this.renderAttributes = this.renderAttributes.bind(this);
        this.toggleAttributes = this.toggleAttributes.bind(this);
        this.onRemoveImage = this.onRemoveImage.bind(this);
        this.onImageUploaded = this.onImageUploaded.bind(this);
        this.handleValidSubmit = this.handleValidSubmit.bind(this);
        this.fireSubmitForm = this.fireSubmitForm.bind(this);
        this.selectLogistic = this.selectLogistic.bind(this);
        this.uploadImageToServer = this.uploadImageToServer.bind(this);
        this.isMainImage = this.isMainImage.bind(this);
        this.onSelectMainImage = this.onSelectMainImage.bind(this);
        this.validationForm = this.validationForm.bind(this);
        this.defaultValueWithParent = this.defaultValueWithParent.bind(this);
        this.handleInvalidSubmit = this.handleInvalidSubmit.bind(this);
        this.selectDate = this.selectDate.bind(this);
        this.fetchShopeeShopList = this.fetchShopeeShopList.bind(this);
        this.toggleSyncBySelected = this.toggleSyncBySelected.bind(this);
        this.handleSyncBySelected = this.handleSyncBySelected.bind(this);
        this.toggleSyncPart = this.toggleSyncPart.bind(this);
        this.fetchItemInfo = this.fetchItemInfo.bind(this);
        this.onChangeShopeeShop = this.onChangeShopeeShop.bind(this);
        this.resolveStockQuantity = this.resolveStockQuantity.bind(this);
        this.onChangeDimension = this.onChangeDimension.bind(this);
        this.initShopeeSetting = this.initShopeeSetting.bind(this);
        this.unCheckLogistic = this.unCheckLogistic.bind(this);
        this.resolveSKU = this.resolveSKU.bind(this);
        this.buildVariationRequest = this.buildVariationRequest.bind(this);
        this.getDeletedVariationList = this.getDeletedVariationList.bind(this);
        this.injectVariationIntoRequest = this.injectVariationIntoRequest.bind(this);
        this.isVariationChange = this.isVariationChange.bind(this);
    }

    initShopeeSetting() {
        shopeeService.getProductSettingsSyncByStoreId()
            .then(data => {
                const {id,storeId,name,description,price,stock} = data.data
                const setArrayData = []
                if(name){
                    setArrayData.push("name")
                }
                if(description){
                    setArrayData.push("description")
                }
                if(price){
                    setArrayData.push("price")
                }
                if(stock){
                    setArrayData.push("stock")
                }

                this.setState(state => ({
                    syncPartList: setArrayData,
                    id,
                    storeId,
                    name,
                    description,
                    price,
                    stock,
                }),()=>{
                    shopeeService.loadShopeeSetting()
                        .then(shopeeShop => {
                            const {settingObject} = shopeeShop
                            const enabledStock = !settingObject.autoSynStock // enabled if autoSynStock is disable
                            this.setState({
                                enabledStock,
                                stock:settingObject.autoSynStock
                            })

                            this.toggleSyncPart({
                                currentTarget: {
                                    value: PRODUCT_SYNC_PART.STOCK,
                                    checked: true
                                }
                            })
                        })
                })
            })
            .catch(() => GSToast.commonError())
    }

    handleSyncBySelected(event){
        const data={
            id: this.state.id,
            storeId: this.state.storeId,
            name: this.state.name,
            description: this.state.description,
            price: this.state.price,
            stock: this.state.stock
        };
        shopeeService.editProductSettingsSyncs(data)
            .then(data => {
                GSToast.commonUpdate()
            })
            .catch(() => GSToast.commonError())

        this.setState(state => ({
            syncBySelected: !state.syncBySelected
        }))
    }

    toggleSyncBySelected(event) {
        this.setState(state => ({
            syncBySelected: !state.syncBySelected
        }))
    }

    fetchShopeeShopList() {
        // get connected account but not linked yet

        shopeeService.getConnectedShops()
            .then(accountList => {
                let mergedAccountList = [...accountList]
                shopeeService.getLinkedItems(this.state.itemId)
                    .then(itemList => {
                        mergedAccountList = mergedAccountList.filter(acc => {
                            if (itemList.find(spItem => spItem.shopeeShopId == acc.id)) return false; // already sync
                            return true
                        })

                        this.setState({
                            shopeeSelectedShopId: mergedAccountList[0]? mergedAccountList[0].id:undefined,
                            shopeeShopList: mergedAccountList.map(acc => ({label: acc.shopName, value: acc.shopId}))
                        })
                    })

            })
    }

    componentWillUnmount() {
    }

    async componentDidMount() {
        this._isMounted = true

        if (this._isMounted) {
            this.setState({
                isFetching: true
            })
        }


        this.initShopeeSetting()

        // get shopee accounts first
        const shopeeShopList = await shopeeService.getConnectedShops();
        const linkedItems = await shopeeService.getLinkedItems(this.state.itemId)
        if (shopeeShopList.length === 0 || linkedItems.length === 0) { // if has no account OR has no linked => redirect to shopee accounts page
            RouteUtils.redirectWithoutReload(this.props, NAV_PATH.shopeeAccount)
            return;
        }

        // combine linked item shop with shop information
        const mergeShopeeShopList = []
        for (const item of linkedItems) {
            const shopeeShop = shopeeShopList.find(shop => shop.shopId === item.shopeeShopId )
            if (shopeeShop) {
                mergeShopeeShopList.push({
                    label: shopeeShop.shopName,
                    value: shopeeShop.shopId,
                    shopeeShopId: shopeeShop.shopId,
                    shopTableId: shopeeShop.id,
                    shop: shopeeShop
                })
            }
        }

        const selectedItem = mergeShopeeShopList[0]
        if (mergeShopeeShopList.length === 0) {
            RouteUtils.redirectWithoutReload(this.props, NAV_PATH.shopeeProductList)
        }

        this.setState({
            shopeeShopList: mergeShopeeShopList,
            shopeeSelectedItem: selectedItem,
        }, () => {
            this.pmCategories = shopeeService.getCategories();
            this.fetchItemInfo(selectedItem.shopTableId, selectedItem.shopeeShopId)
        })

    }


    /**
     *
     * @param dimensionType "length"|"width"|"height"|"weight"
     * @param value
     */
    onChangeDimension(dimensionType, value) {
        const product = this.state.product
        product.shippingInfo = {
            ...product.shippingInfo,
            [dimensionType]: value
        }
        this.setState({
            product: product
        }, () => {
            this.validateLogistic()
        })
    }

    fetchItemInfo(shopTableId, shopeeShopId) {
        // show loading and remove error
        this.setState({
            isFetching: true,
            submitCategoryError : '',
            submitLogisticError: ''
        })
        this.pmItemProduct = ItemService.fetch(this.state.itemId);
        this.pmProduct = shopeeService.getSyncProductDetail(this.state.itemId, shopeeShopId);
        this.pmLogistics = shopeeService.getLogistics(shopTableId);

        this.pmFetchAll = Promise.all([this.pmProduct, this.pmCategories, this.pmLogistics, this.pmItemProduct])
        this.pmFetchAll
            .then( result => {
                let resProduct = result[0]
                const resCate = result[1]
                const resLgt = result[2]
                let itemProduct = result[3]

                if (resProduct.variations != null) {
                    resProduct.variations = resProduct.variations.map((variation) => { return {
                        ...variation,
                        id: variation.shopeeVariationId,
                        sku: variation.variationSku,
                        totalItem: variation.stock,
                        newPrice: variation.price,
                        orgPrice: variation.price
                    }})
                }

                // set shipping info
                resProduct.shippingInfo.length = itemProduct.shippingInfo.length;
                resProduct.shippingInfo.width = itemProduct.shippingInfo.width;
                resProduct.shippingInfo.height = itemProduct.shippingInfo.height;
                resProduct.shippingInfo.weight = itemProduct.shippingInfo.weight;


                this.setState({
                    product: resProduct,
                    gosellProduct: itemProduct,
                    productImages: itemProduct.images,
                    shippingInfo: resProduct,
                    categories: resCate,
                    isFetching: false,
                    categoryId: resProduct.cateId,
                    logisticsSelected: resProduct.logistics,
                }, () => {
                    this.fetchLogistic(shopTableId)
                });

                // get attribute
                // shopeeService.getAttributes(resProduct.cateId, shopeeShopId).then( attributes =>{
                //     this.setState({
                //         attributesMandatory: attributes.filter( attr => attr.is_mandatory),
                //         attributesNonMandatory: attributes.filter( attr => !attr.is_mandatory)
                //     });
                //
                // }).catch(e => {
                // });
            })
            .catch( e => {})
    }

    fetchLogistic(shopId) {
        shopeeService.getLogistics(shopId)
            .then(resLgt => {
                this.setState({
                    logistics: resLgt.logistics.map( lgt => { return {...lgt, self: false}}),
                }, () => {
                    this.validateLogistic()
                })
            })
    }

    validateLogistic() {
        const lgList = [...this.state.logistics]
        lgList.forEach(lg => {
            let extendedValidate
            if (lg.id === Constants.LogisticCode.Shopee.GIAO_HANG_TIET_KIEM) {
                extendedValidate = ({ length, width, height }) => (
                    length * width * height < 60000
                )
            }
            const { valid, errorMsgList } = logisticValidate(lg, this.state.product.shippingInfo, extendedValidate)
            lg.valid = valid
            lg.errorMsgList = errorMsgList
            if (!lg.valid) {
                this.unCheckLogistic(lg)
            }
        })
        this.setState({
            logistics: lgList,
            isFetching: false
        })
    }

    unCheckLogistic(lg) {

    }

    defaultValue(key, defaultV) {
        if (Object.keys(this.state.product).length === 0 && this.state.product.constructor === Object)
            return defaultV;
        return this.state.gosellProduct[key];

    }

    defaultValueWithParent(parent, key, defaultV) {
        if (!this.state.product) return defaultV;
        return this.state.product[parent][key];
    };

    isMainImage(index) {
        if (this.state.prodImageMain === -1) {
            if (index === 0) {
                this.setState({
                    prodImageMain: 0
                })
                return true
            }
        } else {
            if (this.state.prodImageMain === index)
                return true
            return false
        }
    }

    onSelectMainImage(index) {
        this.setState({
            prodImageMain: index
        })
    };

    onRemoveImage(index) {
        let lstImgTemp = this.state.productImages;
        lstImgTemp.splice(index, 1)
        let prodImageMain = this.state.prodImageMain

        if (lstImgTemp.length === 0) {
            prodImageMain = -1

        } else {
            if (prodImageMain === index) {

                // if remove the index => set index at 0
                prodImageMain = 0;
            }
        }

        this.setState({
            productImages: lstImgTemp,
            prodImageMain: prodImageMain,
            isValidImageAmount: lstImgTemp.length >= 1
        })
    };
    onImageUploaded(files) {
        if (!Array.isArray(files)) {
            files = [...files]
        }
        //filter wrong extension
        files = files.filter(file => {
            if (['image/jpg','image/png','image/jpeg'].includes(file.type)) { // => correct
                return true
            } else {
                GSToast.error(i18next.t("component.product.addNew.images.wrongFileType", {
                    fileName: file.name
                }))
                return false
            }
        })
        // filter size
        files = files.filter((file) => file.size / 1024 / 1024 < this.IMAGE_MAX_SIZE_BY_MB)
        // files = files.filter( (file) => file.size / 1024 < 50)


        // filter length
        let tArr = [...this.state.productImages, ...files].slice(0, this.IMAGE_MAX_LENGTH)

        if(this.state.productImages.length === 0){
            this.setState({prodImageMain: 0});
        }

        this.setState({
            productImages: [...tArr],
            isValidImageAmount: tArr.length >= 1
        })
    }
    onChangePrice(price) {

    }
    onImageDrop(files) {
        this.onImageUploaded(files)
    }

    toggleMoreInfo() {
        this.setState( state => {
           return {
                isCollapsed: !state.isCollapsed
            }
        })
    }

    toggleAttributes() {
        this.setState( state => {
            return {
                isShowAllAttributes: !state.isShowAllAttributes
            }
        })
    }

    onSelectCategory(categoryId) {

        this.setState({
            isFetchingAttributes: true,
            categoryId: categoryId,
            submitCategoryError : ''
        })

        this.pmAttributes = shopeeService.getAttributes(categoryId, this.state.shopeeSelectedItem.shop.shopId)
        this.pmAttributes
            .then( attributes => {
                this.setState({
                    attributesMandatory: attributes.filter( attr => attr.is_mandatory),
                    attributesNonMandatory: attributes.filter( attr => !attr.is_mandatory),
                    isFetchingAttributes: false
                })
            })
            .catch(e => {
                this.setState({
                    isFetchingAttributes: false
                })
            })
    }

    uploadImageToServer() {
        let promiseArr = [];

        for (let image of this.state.productImages) {
            if (image.id) continue
            let uploadHandle = mediaService.uploadFileWithDomain(
                image, MediaServiceDomain.ITEM
            )
            promiseArr.push(uploadHandle)
        }
        return Promise.all(promiseArr)
    }

    selectLogistic(logistic){
        logistic.shopeeLogisticId = logistic.id;

        let lstSelected = this.state.logisticsSelected;
        let existIndex = lstSelected.findIndex(lo => lo.shopeeLogisticId == logistic.id);

        if(existIndex === -1){
            lstSelected.push(logistic);
        }else{
            lstSelected.splice(existIndex, 1);
        }
        this.setState({logisticsSelected : lstSelected});

        if(lstSelected && lstSelected.length > 0){
            this.setState({submitLogisticError : ''});
        }
    }

    selectDate(e, picker, inputId){
        let startTime = picker.startDate;
        const stringTime = moment(startTime).format(DATE_RANGE_LOCATE_CONFIG.UI_DATE_FORMAT);
        $(`#${inputId}`).val(stringTime);
        this.lstSpecialAttr = this.lstSpecialAttr.filter(data => data.id !== inputId);
        this.lstSpecialAttr.push({id : inputId, value: stringTime});
    }

    fireSubmitForm(){
        this.refSubmitFrom.current.click();
    }

    handleInvalidSubmit(){
        this.setState({isValidForm : false});
    }

    validationForm(variations){
        // check image
        if(this.state.productImages.length < 1){
            return false;
        }

        // check price
        if(variations.length === 0 && this.refProdPrice.current.isValid() == false){
            return false;
        }

        // refProdStock
        if(variations.length === 0 && this.refProdStock.current.isValid() == false){
            return false;
        }

        // refProdWeight
        if(!this.refProdWeight.current.isValid()){
            return false;
        }

        // refProdLength
        if(!this.refProdLength.current.isValid()){
            return false;
        }

        // refProdWidth
        if(!this.refProdWidth.current.isValid()){
            return false;
        }

        // refProdHeight
        if(!this.refProdHeight.current.isValid()){
            return false;
        }

        // validate variation //show message in itself
        if(variations.length > 400){
            return false;
        }

        return true;
    }

    buildVariationRequest() {
        //-------------------------------//
        // get variation
        //-------------------------------//
        let variations = [];
        let tier_variations = [];

        if(this.refProdVariation.current){

            if(this.refProdVariation.current.isInvalidForm()){
                this.refProdVariation.current.refFrom.current.submit();
                this.setState({
                    isSaving : false,
                    isValidForm : false
                });
                return;
            }

            tier_variations = this.refProdVariation.current.getTiers();
            let isOneOrTwo = tier_variations.length;

            let variationsT = this.refProdVariation.current.getVariations();
            variationsT.forEach(va =>{

                // change index string to list
                let tierIndexString = va.tierIndex.split(',');
                let tierIndexInt = [];
                tierIndexString.forEach(index => {
                    tierIndexInt.push(parseInt(index));
                });

                // get name of variation
                let va_name = '';

                if(isOneOrTwo === 1){
                    va_name = tier_variations[0].options[tierIndexInt[0]];
                }else{
                    va_name = tier_variations[0].options[tierIndexInt[0]] + ',' +  tier_variations[1].options[tierIndexInt[1]];
                }

                variations.push({
                    variation_id: va.id,
                    price: va.newPrice,
                    tier_index: tierIndexInt,
                    name: va_name,
                    variation_sku: va.sku ? va.sku : null,
                    stock: va.totalItem,
                    bcModelId: va.bcModelId
                });
            })


        }

        return  {
            variations, tier_variations
        }
    }

    isVariationChange(requestedVariation, shopeeVariation) {
        // price
        if (requestedVariation.price !== shopeeVariation.newPrice) {
            return true;
        }
        // sku
        if (requestedVariation.variation_sku != shopeeVariation.variation_sku) {
            return true;
        }
        return false;
    }

    getChangedVariationList(requestVariations) {
        const changedVariationList = requestVariations.filter(rqVar => {
            const shopeeVar = this.state.product.variations.find(shopeeVar => shopeeVar.id === rqVar.variation_id)
            return shopeeVar && this.isVariationChange(rqVar, shopeeVar)
        })
        return changedVariationList
    }

    getDeletedVariationList() {
        const gosellModelIdList = this.state.gosellProduct.models.map(model => model.id)
        const deletedShopeeVariations = this.state.product.variations.filter(shopeeVar => !gosellModelIdList.includes(shopeeVar.bcModelId))
        return deletedShopeeVariations
    }

    getNewAndChangedVariationList(requestVariations, changedVariations) {
        const changedVarIds = changedVariations.map(changedVar => changedVar.variation_id)
        // remove id when changed variation
        const result = requestVariations.filter(rqVar => {
            if (!rqVar.variation_id) { // new variation
                return true
            }
            if (changedVarIds.includes(rqVar.variation_id)) { // update variation
                return true
            }
            return false
        })

        result.forEach(variation => {
            variation.variation_id = undefined
        })

        return result
    }

    injectVariationIntoRequest(request, requestVariations, tier_variations) {
        // add variation to request
        // CASE: Shopee has no models AND gosell has models
        if (!this.state.product.hasModel && this.state.gosellProduct.hasModel) {
            request.is_2_tier_item = false
            request.tier_variation = tier_variations
            request.variation = requestVariations
        }
        // CASE: Shopee has model AND gosell change model
        if (this.state.product.hasModel && this.state.gosellProduct.hasModel) {
            request.delete_variation_ids = this.state.product.variations.map(variation => variation.id)
            request.is_2_tier_item = true
            request.tier_variation = tier_variations
            request.variation = requestVariations.map(variation => ({...variation, variation_id: undefined}))
        }
        // CASE: Shopee and GoSell have no model
        if (!this.state.product.hasModel && !this.state.gosellProduct.hasModel) {
            request.is_2_tier_item = false
        }
        // CASE: Shopee has model AND gosell has NO model
        if (this.state.product.hasModel && !this.state.gosellProduct.hasModel) {
            request.delete_variation_ids = this.state.product.variations.map(variation => variation.id)
        }
    }

    handleValidSubmit(event, values){

        // loading
        this.setState({
            isSaving : true,
            submitCategoryError : '',
            submitLogisticError: ''
        });

        //-------------------------------//
        // get attribute first
        //-------------------------------//
        let lstTotalAttr = [...this.state.attributesNonMandatory, ...this.state.attributesMandatory];

        let lstAttrSelected = [];
        lstTotalAttr.forEach( attr => {

                let attrT;
                if(attr.input_type === 'TEXT_FILED' && attr.attribute_type === 'TIMESTAMP_TYPE'){
                    // in case required
                    let data = this.lstSpecialAttr.filter(ele => ele.id === "attr_" + attr.attribute_id);

                    if(attr.is_mandatory && ( !data || data.length === 0) ){
                        // in case empty data
                        this.setState({
                            isSaving : false
                        });
                        return false;
                    }
                    if(data && data.length > 0){
                        const timeString = moment(data[0].value, DATE_RANGE_LOCATE_CONFIG.UI_DATE_FORMAT).format('X')
                        attrT = {
                            attributes_id : attr.attribute_id,
                            value : timeString
                        }
                    }

                }else if (attr.input_type === 'TEXT_FILED' && attr.attribute_type === 'DATE_TYPE'){
                    let valueData = values["attr_" + attr.attribute_id];
                    if(valueData && valueData.length > 0){
                        const timeString = moment(valueData + " 00:00", 'YYYY-MM-DD HH:mm').format('X')
                        attrT = {
                            attributes_id : attr.attribute_id,
                            value : timeString
                        }
                    }
    
                }else{

                    let valueData = values["attr_" + attr.attribute_id];

                    if(valueData){
                        if('QUANTITATIVE' === attr.format_type){
                            // has quantitative -> get value of it

                            let attributeUnit = "";

                            // for special case combobox or drop down
                            if(attr.input_type === 'DROP_DOWN' || attr.input_type === 'COMBO_BOX'){
                                // DROP_DOWN or COMBO_BOX
                                //attr.unit_list.sort((a, b) => {return b.length - a.length;});

                                // find the attribute unit in selected value
                                // attr.unit_list.forEach((unit, index) => {
                                //     if(valueData.includes(unit) && !attributeUnit){
                                //         attributeUnit = unit;
                                //     }
                                // });

                                //valueData = valueData.replace(attributeUnit, "");

                            }else{
                                // text
                                attributeUnit = values["attr_quantitative_" + attr.attribute_id];
                                valueData = valueData + attributeUnit + '';
                            }

                            attrT = {
                                attributes_id : attr.attribute_id,
                                value : valueData
                            }

                        }else{
                            attrT = {
                                attributes_id : attr.attribute_id,
                                value : valueData
                            }
                        }
                        
                    }
                }

                if(attrT){
                    lstAttrSelected.push(attrT);
                }
        });

        //-------------------------------//
        // get variation
        //-------------------------------//
        let {variations, tier_variations} = this.buildVariationRequest()
        let hasVariation = variations.length > 0;

        //-------------------------------//
        // get logistic
        //-------------------------------//
        let lstLogisticSelected = [];

        this.state.logistics.forEach( lo => {
            let enable;

            if(this.state.logisticsSelected.findIndex(lo2 => lo.id === lo2.id) !== -1){
                enable = true;
            }else{
                enable = false;
            }

            // only submit enable logistic
            if(enable){
                let loId = lo.id;
                if(lo.maskChannelId && lo.maskChannelId > 0){
                    loId = lo.maskChannelId;
                }

                lstLogisticSelected.push({
                    logistic_id : loId,
                    enabled : enable
                });

                
            }
        });
        // remove duplicated id
        lstLogisticSelected = _.uniqBy(lstLogisticSelected, 'logistic_id');

        //-------------------------------//
        // validate form
        //-------------------------------//
        if(!this.validationForm(variations)){
            this.setState({
                isSaving : false,
                isValidForm : false
            });
            return;
        }

        // check category required
        if(!this.state.categoryId){
            this.setState({
                submitCategoryError : 'common.validation.required',
                isSaving : false,
                isValidForm : false
            });
            return;
        }

        // check logistic
        if(this.state.logisticsSelected.length === 0){
            this.setState({
                submitLogisticError : i18next.t('common.validation.required'),
                isSaving : false,
                isValidForm : false
            });
            return;
        }

        // check image extension
        let imageError = false
        const allowedExtension = ['jpg','jpeg','png']
        const allowedFileType = ['image/png','image/jpg','image/jpeg']
        for (const imageObj of this.state.productImages) {
            if (imageObj.extension && (!allowedExtension.includes(imageObj.extension))) { // new image DTO
                imageError = true
                break
            }
            if (imageObj.type && (!allowedFileType.includes(imageObj.type))) {

                imageError = true
                break
            }
        }



        // final validate
        this.setState({
            isValidForm : !imageError,
            isValidImageType: !imageError,
            isSaving : !imageError,
        });
        if (imageError) {
            return
        }

        //-------------------------------//
        // attribute
        //-------------------------------//
        /**
         * @type {ShopeeRequestAttributeModel[]}
         */
        let attributeList = this.refAttributeSelector.current.getValue()
        //-------------------------------//
        // brand
        //-------------------------------//
        // note: brand is the attribute has id is -1
        /**
         * @type {ShopeeRequestAttributeModel}
         */
        let brand = attributeList.find(attr => attr.attribute_id === BRAND_ATTR_ID)
        if (brand) {
            brand = {
                brand_id: brand.attribute_value_list[0].value_id,
                original_brand_name: brand.attribute_value_list[0].original_value_name
            }
            attributeList = attributeList.filter(attr => attr.attribute_id !== BRAND_ATTR_ID)
        }

        //-------------------------------//
        // start to sync
        //-------------------------------//
        this.uploadImageToServer().then(imageArr => {

            //-------------------------------//
            // get image
            //-------------------------------//
            let lstImages = [...this.state.productImages, ...imageArr];

            let lstImageTotal = [];

            lstImages.forEach(img => {
                (img.urlPrefix) && lstImageTotal.push(
                    ImageUtils.getImageFromImageModel(img)
                )
            });

            // swap image
            let mainImage = lstImageTotal[this.state.prodImageMain];
            lstImageTotal.splice(this.state.prodImageMain, 1);
            lstImageTotal.unshift(mainImage);

            //-------------------------------//
            // request
            //-------------------------------//
            // new information
            let request = {
                shopee_item_id : this.state.product.shopeeItemId,
                bc_item_id : this.state.product.bcItemId,
                category_id : this.state.categoryId,
                days_to_ship: this.state.product.daysToShip,
                name : values["productName"],
                description: formatAfterEditByAvField(values["productDescription"]),
                item_sku : values["productSKU"] ? values["productSKU"] : null,
                attribute_list : attributeList,
                wholesales : [],
                logistics : lstLogisticSelected,
                weight : this.refProdWeight.current.getValue(),
                package_length : this.refProdLength.current.getValue(),
                package_width : this.refProdWidth.current.getValue(),
                package_height : this.refProdHeight.current.getValue(),
                condition : 'NEW',
                price : hasVariation ? 10000 : this.refProdPrice.current.getValue(),
                stock : hasVariation ? 1000 : this.refProdStock.current.getValue(),
                images : lstImageTotal,
                brand: brand
            }

            this.injectVariationIntoRequest(request,variations, tier_variations)

            // revert to un-synced data
            if (!this.state.syncPartList.includes(PRODUCT_SYNC_PART.NAME)) {
                request.name = this.state.product.name
            }
            if (!this.state.syncPartList.includes(PRODUCT_SYNC_PART.DESCRIPTION)) {
                request.description = this.state.product.description
            }
            if (!this.state.syncPartList.includes(PRODUCT_SYNC_PART.PRICE)) {
                request.price = this.state.product.orgPrice
            }
            if (!this.state.syncPartList.includes(PRODUCT_SYNC_PART.STOCK)) {
                request.totalItem = this.state.product.totalItem
            }

            shopeeService.syncEditProduct(request, this.state.shopeeSelectedItem.shopeeShopId).then(res => {
                // success ==> move to list

                this.setState({
                    isSaving : false,
                    redirectPageConfirm : false
                });

                this.fetchItemInfo(this.state.shopeeSelectedItem.shopTableId, this.state.shopeeSelectedItem.shopeeShopId)
                GSToast.commonUpdate()
            }).catch(e => {
                console.error(e)
                // sync product fail
                this.setState({isSaving : false});

                if(e.response.status === 400){
                    if(e.response.data.errorKey && e.response.data.errorKey.indexOf('error_title_character_forbidden') > -1){
                        // show error message
                        GSToast.error(i18next.t('page.shopee.product.edit.item_title.title'));

                    }else if(e.response.data.errorKey && e.response.data.errorKey.indexOf('error_duplicate') > -1){
                        // show error message
                        GSToast.error(i18next.t('page.shopee.product.edit.item_duplicate.title'));

                    }else{
                        GSToast.error(i18next.t('page.shopee.product.edit.unknow_error.title'));

                    }
                }else{
                    GSToast.commonError();

                }
                this.setState({
                    redirectPageConfirm: false
                }, () => {
                    RouteUtils.redirectWithoutReload(this.props, NAV_PATH.shopeeEditProduct + '/' + this.state.itemId)
                })
            });

        }).catch(e => {
            console.error(e)
            // get image fail
            this.setState({isSaving : false});
            GSToast.commonError();
            this.setState({
                redirectPageConfirm: false
            }, () => {
                RouteUtils.redirectWithoutReload(this.props, NAV_PATH.shopeeEditProduct + '/' + this.state.itemId)
            })
        });
    }

    renderQuantitative(attr, unit){
        return (
            <div className="col-6" style={{paddingRight: "0px"}} key={'attr_' + attr.attribute_id + '_row_quantitative'}>
                                        <Label for={'attr-'+attr.attribute_name} className="gs-frm-control__title">
                                        &nbsp;
                                        </Label>
                                        <AvField 
                                            type="select"
                                            name={'attr_quantitative_'+attr.attribute_id}
                                            value={unit}
                                        >
                                            {attr.unit_list.map( (opt, index) => {
                                                return (
                                                    <option key={'attr_quantitative_'+attr.attribute_id + opt + index} value={opt}>
                                                        {opt}
                                                    </option>
                                                )
                                            })}
                                        </AvField>
                                    </div>
        );
    }

    renderAttributes(attributes , selectedAttrs, required) {
        //attribute_id: 4270
        // attribute_name: "Thương hiệu"
        // attribute_type: "STRING_TYPE"
        // input_type: "TEXT_FILED"
        // is_mandatory: false
        // options: []
        // values: []

        // attribute_id: 1475
        // attribute_name: "Brand"
        // attribute_type: "STRING_TYPE"
        // input_type: "COMBO_BOX"
        // is_mandatory: false
        // options: ["PNJ"]
        // 0: "PNJ"
        // values: [{original_value: "PNJ", translate_value: "PNJ"}]
        // 0: {original_value: "PNJ", translate_value: "PNJ"}
        // original_value: "PNJ"
        // translate_value: "PNJ"

        return attributes.map( (attr, index) => {
            let selectedAttr = selectedAttrs.filter( a => attr.attribute_id === a.shopeeAttributeId);
            let value = selectedAttr.length > 0 ? selectedAttr[0].value : '';
            let valueUnit = '';

            if(attr.input_type === 'TEXT_FILED' && attr.attribute_type === 'TIMESTAMP_TYPE'){
                let timeValue;
                let exist = this.lstSpecialAttr.find(data => data.id === 'attr_' + attr.attribute_id);

                // if exist -> get from exit
                if(exist){
                    timeValue = moment(exist.value, DATE_RANGE_LOCATE_CONFIG.UI_DATE_FORMAT);
                }else{
                    timeValue = value ? moment(value, 'X'): moment();
                    this.lstSpecialAttr.push({id: 'attr_' + attr.attribute_id, value: timeValue.format(DATE_RANGE_LOCATE_CONFIG.UI_DATE_FORMAT)});
                }

                value = timeValue;
            }

            if(attr.input_type === 'TEXT_FILED' && attr.attribute_type === 'DATE_TYPE'){
                if(value){
                    value = moment(value, 'DD/MM/YYYY').format("YYYY-MM-DD");
                }
            }

            if(attr.input_type === 'TEXT_FILED' && 'QUANTITATIVE' === attr.format_type){
                // must devide the data in to 2 column
                attr.unit_list.sort((a, b) => {return b.length - a.length;});

                // first is the unit
                attr.unit_list.forEach((unit, index) => {
                    if(value.includes(unit) && !valueUnit){
                        valueUnit = unit;
                    }
                });

                if(!valueUnit){
                    valueUnit = attr.unit_list[0]
                }

                // first is the value
                value = value.replace(valueUnit, "");

            }

            switch (attr.input_type) {
                case 'TEXT_FILED':
                    if (attr.attribute_type === 'STRING_TYPE') {
                        return (
                            <div className="row" key={'attr_' + attr.attribute_id + '_row'}>
                                <div className={'QUANTITATIVE' === attr.format_type ? 'col-6' : 'col-12' } style={{paddingLeft: "0px", paddingRight: "0px"}}>
                                    <Label for={'attr-'+attr.attribute_name} className="gs-frm-control__title">
                                        {attr.attribute_name}
                                    </Label>

                                    <AvField
                                        name={'attr_'+attr.attribute_id}
                                        validate={{
                                            required: {value: required, errorMessage: i18next.t('common.validation.required')},
                                            maxLength: { value: 40, errorMessage: i18next.t("common.validation.char.max.length", { x: 40 }) }
                                        }}
                                        value={value}
                                    />
                                </div>

                                {/* For quantitative */}
                                {
                                    'QUANTITATIVE' === attr.format_type &&
                                    this.renderQuantitative(attr, valueUnit)
                                }

                            </div>
                        )
                    }
                    if (attr.attribute_type === 'INT_TYPE') {
                        return (

                            <div className="row" key={'attr_' + attr.attribute_id + '_row'}>
                                <div className={'QUANTITATIVE' === attr.format_type ? 'col-6' : 'col-12' } style={{paddingLeft: "0px", paddingRight: "0px"}}>
                                    <Label for={'attr-'+attr.attribute_name} className="gs-frm-control__title">
                                        {attr.attribute_name}
                                    </Label>

                                    <AvField
                                        type="number"
                                        name={'attr_'+attr.attribute_id}
                                        validate={{
                                            required: {value: required, errorMessage: i18next.t('common.validation.required')},
                                            maxLength: { value: 40, errorMessage: i18next.t("common.validation.char.max.length", { x: 40 }) }
                                        }}
                                        value={value}
                                    />
                                </div>

                                {/* For quantitative */}
                                {
                                    'QUANTITATIVE' === attr.format_type &&
                                    this.renderQuantitative(attr, valueUnit)
                                }
                            </div>
                        )
                    }
                    if (attr.attribute_type === 'FLOAT_TYPE') {
                        return (
                            <div className="row" key={'attr_' + attr.attribute_id + '_row'}>
                                {/* For value */}
                                <div className={'QUANTITATIVE' === attr.format_type ? 'col-6' : 'col-12' } style={{paddingLeft: "0px", paddingRight: "0px"}}>
                                    <Label for={'attr-'+attr.attribute_name} className="gs-frm-control__title">
                                        {attr.attribute_name}
                                    </Label>

                                    <AvField 
                                        type="number"
                                        name={'attr_'+attr.attribute_id}
                                        value={value}
                                        validate={{
                                            required: {value: required, errorMessage: i18next.t('common.validation.required')},
                                            maxLength: { value: 40, errorMessage: i18next.t("common.validation.char.max.length", { x: 40 }) }
                                        }} 
                                    />
                                </div>

                                {/* For quantitative */}
                                {
                                    'QUANTITATIVE' === attr.format_type &&
                                    this.renderQuantitative(attr, valueUnit)
                                }
                            </div>
                            
                        )
                    }
                    if (attr.attribute_type === 'DATE_TYPE') {
                        return (
                            <div key={'attr_' + attr.attribute_id + '_row'}>
                                <Label for={'attr-'+attr.attribute_name} className="gs-frm-control__title">
                                    {attr.attribute_name}
                                </Label>

                                <AvField
                                    type="date"
                                    name={'attr_'+attr.attribute_id}
                                    validate={{
                                        required: {value: required, errorMessage: i18next.t('common.validation.required')},
                                        maxLength: { value: 40, errorMessage: i18next.t("common.validation.char.max.length", { x: 40 }) }
                                    }}
                                    value={value}
                                />
                            </div>
                        )
                    }
                    if (attr.attribute_type === 'TIMESTAMP_TYPE') {
                        return (
                            <div key={'attr_' + attr.attribute_id + '_row'}>
                                <Label for={'attr-'+attr.attribute_name} className="gs-frm-control__title">
                                    {attr.attribute_name}
                                </Label>
                                <div class="form-group">
                                <DateRangePicker
                                        style={{position: "relative"}}
                                        minimumNights={0}
                                        onApply={(e, pickup) => this.selectDate(e, pickup, 'attr_'+attr.attribute_id)}
                                        locale={DATE_RANGE_LOCATE_CONFIG}
                                        onCancel={(e, pickup) => {}}
                                        singleDatePicker
                                        startDate={value}
                                    >
                                        <input type="text"
                                            id={'attr_'+attr.attribute_id}
                                            onChange={() => {}}
                                            value={value.format(DATE_RANGE_LOCATE_CONFIG.UI_DATE_FORMAT)}
                                            className="form-control"
                                            onKeyPress={ e => e.preventDefault()}
                                            name={'attr_'+attr.attribute_id}
                                        />
                                        <FontAwesomeIcon icon="calendar" color="#939393" size="lg" style={{position: "absolute", top: "10px", right: "10px"}}/>
                                    </DateRangePicker>
                                </div>
                            </div>
                        )
                    }
                    break
                case 'DROP_DOWN':
                case 'COMBO_BOX':
                    return (
                        <div key={'attr_' + attr.attribute_id + '_row'}>
                            <Label for={'attr-'+attr.attribute_name} className="gs-frm-control__title">
                                {attr.attribute_name}
                            </Label>

                            <AvField
                                type="select"
                                name={'attr_'+attr.attribute_id}
                                value={value ? value : ''}
                                validate={{
                                    required: {value: required, errorMessage: i18next.t('common.validation.required')},
                                    maxLength: { value: 40, errorMessage: i18next.t("common.validation.char.max.length", { x: 40 }) }
                                }}
                            >
                                <option key={'attr_'+attr.attribute_id + '_00'} value={''}>
                                    
                                </option>
                                {/*{attr.options.map( (opt, index) => {*/}
                                {/*    return (*/}
                                {/*        <option key={'attr_'+attr.attribute_id + opt + index} value={opt}>*/}
                                {/*            {attr.values[index].translate_value? attr.values[index].translate_value:attr.values[index].original_value}*/}
                                {/*        </option>*/}
                                {/*    )*/}
                                {/*})}*/}
                            </AvField>
                        </div>
                    )
                    break
                case 'TIMESTAMP_TYPE':
                    return (
                        <div key={'attr_' + attr.attribute_id + '_row'}>
                            <Label for={'attr-'+attr.attribute_name} className="gs-frm-control__title">
                                {attr.attribute_name}
                            </Label>

                            <AvField
                                type="date"
                                name={'attr_'+attr.attribute_id}
                                validate={{
                                    required: {value: required, errorMessage: i18next.t('common.validation.required')},
                                    maxLength: { value: 10, errorMessage: i18next.t("common.validation.char.max.length", { x: 10 }) }
                                }}
                            />
                        </div>
                    )
                    break
            }
        })
    }

    formatBeforeEditByAvField(value) {
        let processBr = value ? value.replace(/<p>/g, '').replace(/<\/p>/g, '\n').replace(/<br>/g, '\n') : '';
        return StringUtils.htmlToPlainText(processBr)
    }

    formatAfterEditByAvField(value) {
        return value ? value.replace(/<p>/g, '').replace(/<\/p>/g, '<br>').replace(/\n/g, '<br>') : '';
    }


    onChangeShopeeShop(option) {
        const {shopTableId, shopeeShopId} = option
        this.setState({
            shopeeSelectedItem: option
        })
        this.fetchItemInfo(shopTableId, shopeeShopId)
    }

    toggleSyncPart(event) {
        const {checked, value} = event.currentTarget
        const partSet = new Set([...this.state.syncPartList])
        if (checked) { // add to set list
            partSet.add(value)
        } else {
            partSet.delete(value)
        }
        this.setState({
            syncPartList: [...partSet]
        })
        this.setState(state => ({
            [value]: checked
        }))


    }

    resolveStockQuantity() {
        const currentShop = this.state.shopeeSelectedItem.shop
        if (currentShop && this.state.gosellProduct) {
            const {branchId} = currentShop
            const productBranchList = this.state.gosellProduct.branches
            const productMatchedBranch = productBranchList.find(branch => branch.branchId == branchId)
            if (productMatchedBranch) {
                return productMatchedBranch.totalItem
            }
        }
        return 0
    }

    resolveSKU() {
        const currentShop = this.state.shopeeSelectedItem.shop
        if (currentShop && this.state.gosellProduct) {
            const {branchId} = currentShop
            const productBranchList = this.state.gosellProduct.branches
            const productMatchedBranch = productBranchList.find(branch => branch.branchId == branchId)
            if (productMatchedBranch) {
                return productMatchedBranch.sku
            }
        }
        return ""
    }


    render() {

       let subcate = this.state.subCategories;

        return (
            <>
            {this.state.isSaving && <LoadingScreen/> }

            <Modal isOpen={this.state.syncBySelected}>
                <ModalHeader>
                    <GSTrans t="page.shopee.product.syncHint"/>
                </ModalHeader>
                <ModalBody>
                    <div className="shopee-product__sync-opt background-color-lightgray2 p-3">
                        <UikCheckbox label={i18next.t`page.shopee.products.modal.action.name`}
                                     value={PRODUCT_SYNC_PART.NAME}
                                     onChange={this.toggleSyncPart}
                                     defaultChecked={this.state.syncPartList.includes(PRODUCT_SYNC_PART.NAME)}
                        />
                        <UikCheckbox label={i18next.t`page.shopee.products.modal.action.description`}
                                     value={PRODUCT_SYNC_PART.DESCRIPTION}
                                     onChange={this.toggleSyncPart}
                                     defaultChecked={this.state.syncPartList.includes(PRODUCT_SYNC_PART.DESCRIPTION)}
                        />
                        <UikCheckbox label={i18next.t`page.shopee.products.modal.action.price`}
                                     value={PRODUCT_SYNC_PART.PRICE}
                                     onChange={this.toggleSyncPart}
                                     defaultChecked={this.state.syncPartList.includes(PRODUCT_SYNC_PART.PRICE)}
                        />
                        <UikCheckbox label={i18next.t`page.shopee.products.modal.action.stock`}
                                     value={PRODUCT_SYNC_PART.STOCK}
                                     onChange={this.toggleSyncPart}
                                     defaultChecked={this.state.syncPartList.includes(PRODUCT_SYNC_PART.STOCK)}
                                     disabled={!this.state.enabledStock}
                        />
                    </div>
                    {!this.state.enabledStock &&
                        <div className="text-center mt-3 font-size-14px">
                            <em>
                                <GSTrans t="page.shopee.product.noticeStockAutoSync">
                                    <strong style={{
                                        textDecoration: "underline"
                                    }}>Notice:</strong>1
                                </GSTrans>
                            </em>
                        </div>
                    }
                </ModalBody>
                <ModalFooter>
                    <GSButton success onClick={this.handleSyncBySelected}>
                        <GSTrans t="common.btn.ok"/>
                    </GSButton>
                </ModalFooter>
            </Modal>

            <GSContentContainer className="shoppe-product-container" isLoading={this.state.isFetching} confirmWhenRedirect={true} confirmWhen={this.state.redirectPageConfirm}>
                <GSContentHeader>
                    <div className="mr-auto d-flex align-items-center">
                        <Breadcrumb>
                            <BreadcrumbItem>Shopee</BreadcrumbItem>
                            <BreadcrumbItem>
                                <Trans i18nKey="page.shopee.product.edit.create.list.title">
                                    Create listing
                                </Trans>
                            </BreadcrumbItem>
                        </Breadcrumb>
                        <UikSelect options={this.state.shopeeShopList}
                                   value={[{value: this.state.shopeeSelectedItem? this.state.shopeeSelectedItem.shopeeShopId:undefined}]}
                                   className="ml-2"
                                   onChange={this.onChangeShopeeShop}
                        />
                    </div>

                    <GSButton success outline marginRight onClick={this.toggleSyncBySelected}>
                        <GSTrans t="page.shopee.product.btn.editSyncConfiguration"/>
                    </GSButton>

                    <GSButton secondary marginLeft outline onClick={() => RouteUtils.linkTo(this.props, NAV_PATH.products)}>
                        <Trans i18nKey="common.btn.cancel" className="sr-only">
                            Cancel
                        </Trans>
                    </GSButton>
                    <GSButton success className="btn-save" marginLeft onClick={this.fireSubmitForm} >
                        <Trans i18nKey="common.btn.update" className="sr-only">
                            Update
                        </Trans>
                    </GSButton>
                </GSContentHeader>
                {!this.state.isFetching &&
                <GSContentBody size={GSContentBody.size.LARGE}>
                    {   !this.state.isValidForm &&
                        <div className="alert alert-danger product-form__alert product-form__alert--error" role="alert">
                            <Trans i18nKey="component.product.edit.invalidate"/>
                        </div>
                    }

                    <AvForm onValidSubmit={this.handleValidSubmit} onInvalidSubmit={this.handleInvalidSubmit} autoComplete="off">

                        {/*PRODUCT INFORMATION*/}
                        <GSWidget className="gs-widget">
                            <GSWidgetHeader>
                                <Trans i18nKey="page.shopee.product.edit.listingdetail.title">
                                    Listing Detail
                                </Trans>
                                <GSWidgetHeaderSubtitle>
                                    <Trans i18nKey="page.shopee.product.edit.confirm.title">
                                        Verify or edit product detail you want to sync to Shopee
                                    </Trans>
                                </GSWidgetHeaderSubtitle>
                            </GSWidgetHeader>


                            <GSWidgetContent>
                                    <UikContentTitle>
                                        <Trans i18nKey="page.shopee.product.edit.selectedproduct.title">
                                            Selected Product
                                        </Trans>
                                    </UikContentTitle>
                                    <section className="selected-product">
                                        <img src={
                                            this.state.productImages.length > 0 && this.state.productImages[this.state.prodImageMain].urlPrefix
                                                ? ImageUtils.getImageFromImageModel(this.state.productImages[this.state.prodImageMain])
                                                : this.state.productImages.length > 0
                                                ? URL.createObjectURL(this.state.productImages[this.state.prodImageMain])
                                                : '/assets/images/default_image.png'
                                        }/>
                                        <span>
                                            <label>{this.state.gosellProduct.name}</label>
                                            <p>{ this.state.gosellProduct.orgPrice > this.state.gosellProduct.newPrice
                                                    ?CurrencyUtils.formatMoneyByCurrency(this.state.gosellProduct.newPrice, this.defaultValue(ProductModelKey.CURRENCY, 0)) + " ~ " + CurrencyUtils.formatMoneyByCurrency(this.state.gosellProduct.orgPrice, this.defaultValue(ProductModelKey.CURRENCY, 0))
                                                    :this.state.gosellProduct.orgPrice < this.state.gosellProduct.newPrice
                                                    ?CurrencyUtils.formatMoneyByCurrency(this.state.gosellProduct.orgPrice, this.defaultValue(ProductModelKey.CURRENCY, 0)) + " ~ " + CurrencyUtils.formatMoneyByCurrency(this.state.gosellProduct.newPrice, this.defaultValue(ProductModelKey.CURRENCY, 0))
                                                    :CurrencyUtils.formatMoneyByCurrency(this.state.gosellProduct.orgPrice, this.defaultValue(ProductModelKey.CURRENCY, 0))
                                                }
                                            </p>
                                        </span>
                                        <span className={"btn-more-info"} onClick={this.toggleMoreInfo}>
                                            {this.state.isCollapsed && <FontAwesomeIcon className="collapse-expand" icon={"plus-circle"}/>}
                                            {!this.state.isCollapsed && <FontAwesomeIcon className="collapse-expand" icon={"minus-circle"}/>}
                                        </span>
                                    </section>
                                    <div className="gs-ani__fade-in" hidden={this.state.isCollapsed}>
                                        <div style={{
                                            marginBottom: '1em'
                                        }}>
                                            <Trans i18nKey="page.shopee.product.edit.overwrite.title">
                                                <span style={{
                                                    fontWeight: 'bold',
                                                    textDecoration: 'underline'
                                                }}>
                                                </span>
                                                Below information are linked with respective product. You can edit before syncing to Shopee,
                                                but the link will be broken, further updates to GoSell product might not update to Shopee.
                                            </Trans>
                                        </div>

                                        <UikContentTitle>
                                            <Trans i18nKey="component.product.addNew.productInformation.name">
                                                Product Name
                                            </Trans>
                                        </UikContentTitle>
                                        <AvFieldCountable
                                            name={'productName'}
                                            type={'input'}
                                            isRequired={true}
                                            minLength={10}
                                            maxLength={120}
                                            rows={12}
                                            value={this.state.gosellProduct.name}
                                        />

                                        <UikContentTitle>
                                            <Trans i18nKey="page.shopee.product.edit.description.title">
                                                Description
                                            </Trans>
                                        </UikContentTitle>
                                        <AvFieldCountable
                                            className="product-description"
                                            name={'productDescription'}
                                            type={'textarea'}
                                            isRequired={true}
                                            minLength={100}
                                            maxLength={3000}
                                            rows={12}
                                            value={formatBeforeEditByAvField(this.state.gosellProduct.description)}
                                        />
                                    </div>


                                    <button type="submit" hidden={true} ref={this.refSubmitFrom}></button>
                            </GSWidgetContent>
                        </GSWidget>

                        {/*IMAGE*/}
                        <GSWidget className="gs-widget">
                                <GSWidgetHeader>
                                    <Trans i18nKey="component.product.addNew.images.title">
                                        Images
                                    </Trans>
                                </GSWidgetHeader>
                            <GSWidgetContent className={'widget__content'}
                                              className={this.state.isSaving ? 'gs-atm--disable' : ''}>
                                <div className="image-drop-zone" hidden={this.state.productImages.length > 0}>
                                    <Dropzone onDrop={file => this.onImageUploaded(file)} >
                                        {({ getRootProps, getInputProps }) => (
                                            <section>
                                                <div {...getRootProps()}>
                                                    <input {...getInputProps()} accept={ImageUploadType.JPEG + ',' + ImageUploadType.PNG} />
                                                    <p><FontAwesomeIcon icon={'upload'} className="image-drop-zone__icon" /></p>
                                                    <p>
                                                        <GSTrans t="component.product.addNew.images.dragAndDrop" values={{maxSize: this.IMAGE_MAX_SIZE_BY_MB}}>
                                                            dragAndDrop
                                                        </GSTrans>
                                                    </p>
                                                </div>
                                            </section>
                                        )}
                                    </Dropzone>
                                </div>

                                <div className="image-widget__container" hidden={this.state.productImages.length === 0}>
                                    {this.state.productImages.map(
                                        (item, index) => {
                                            return (<ImageView
                                                key={(item.id? item.id:item.name) + index}
                                                src={item}
                                                arrIndex={index}
                                                isMain={this.isMainImage(index)}
                                                onRemoveCallback={this.onRemoveImage}
                                                onSelectCallback={this.onSelectMainImage}
                                                validate={!this.state.isValidImageType}
                                                allowedExtensions={['jpg','jpeg','png']}
                                            />)
                                        })}
                                    <span className="image-widget__image-item image-widget__image-item--no-border">
                                                    <ImageUploader
                                                        hidden={this.state.productImages.length >= this.IMAGE_MAX_LENGTH}
                                                        accept={[ImageUploadType.JPEG, ImageUploadType.PNG]}
                                                        multiple={true}
                                                        text={i18next.t('page.shopee.product.edit.addphoto.title')}
                                                        onChangeCallback={this.onImageUploaded}
                                                        maximumFileSizeByMB={this.IMAGE_MAX_SIZE_BY_MB}
                                                    />
                                                </span>
                                </div>
                                <div className="image-widget__error-wrapper">
                                    <AlertInline
                                        text={i18next.t("component.product.addNew.images.errAmountMessage_01")}
                                        type="error"
                                        nonIcon
                                        hidden={this.state.isValidImageAmount}
                                    />
                                    <AlertInline
                                        text={i18next.t`page.shopee.product.edit.unSupportExtension`}
                                        type="error"
                                        nonIcon
                                        hidden={this.state.isValidImageType || !this.state.isValidImageAmount}
                                    />
                                </div>
                            </GSWidgetContent>
                        </GSWidget>

                        {/*PRICE*/}
                        {!this.state.gosellProduct.hasModel &&
                            <GSWidget>
                            <GSWidgetHeader>
                                <Trans i18nKey="page.product.create.pricing">
                                    Pricing
                                </Trans>
                            </GSWidgetHeader>
                            <GSWidgetContent>
                                {/*Price*/}

                                <div className="col-lg-6 col-md-6 col-sm-12">
                                    <Label for={'productPrice'} className="gs-frm-control__title">
                                        <Trans i18nKey="component.product.addNew.pricingAndInventory.price">
                                            Price
                                        </Trans>
                                    </Label>

                                    <CryStrapInput
                                        ref={this.refProdPrice}
                                        name={'productPrice'}
                                        thousandSeparator=","
                                        precision="0"
                                        unit={this.state.gosellProduct.currency}
                                        default_value={
                                            this.state.gosellProduct.orgPrice
                                        }
                                        min_value={Constants.N1_000}
                                        max_value={Constants.N120_000_000}
                                        on_change_callback={this.onChangePrice}
                                    />
                                </div>
                            </GSWidgetContent>
                        </GSWidget>
                        }

                        {/*WAREHOUSING*/}
                        <GSWidget>
                            <GSWidgetHeader>
                                <GSTrans t="page.product.create.warehousing"/>
                            </GSWidgetHeader>
                            <GSWidgetContent className="row">
                                {/*SKU*/}
                                <div className="pl-md-0 col-lg-6 col-md-6 col-sm-12">
                                    <Label for={'productSKU'} className="gs-frm-control__title">SKU (Stock keeping unit)</Label>
                                    <AvField
                                        onChange={(e, v) => {this.ipSku = v}}
                                        value={this.resolveSKU()}
                                        name={'productSKU'}
                                        validate={{
                                            minLength: { value: 1, errorMessage: i18next.t("common.validation.char.min.length", { x: 1 }) },
                                            maxLength: { value: 100, errorMessage: i18next.t("common.validation.char.max.length", { x: 100 }) }
                                        }}
                                    />
                                </div>

                                {/*Quantity*/}
                                {!this.state.gosellProduct.hasModel &&
                                <div className="pr-md-0 col-lg-6 col-md-6 col-sm-12">
                                    <Label for={'productQuantity'} className="gs-frm-control__title">
                                        <Trans i18nKey="component.product.addNew.pricingAndInventory.stock">
                                            Stock
                                        </Trans>
                                    </Label>

                                    <CryStrapInput
                                        ref={this.refProdStock}
                                        name={'productQuantity'}
                                        thousandSeparator=","
                                        precision="0"
                                        unit={CurrencySymbol.NONE}
                                        default_value={
                                            this.resolveStockQuantity()
                                        }
                                        max_value={Constants.N999_999}
                                        min_value={Constants.N0}
                                        className={this.state.enabledStock? "":"gs-atm--disable"}

                                    />
                                </div>
                                }
                            </GSWidgetContent>
                        </GSWidget>


                        {/*VARIANTS*/}
                        {this.state.gosellProduct.hasModel &&
                        <GSWidget>
                            <GSWidgetHeader>
                                    <Trans i18nKey="page.shopee.product.detail.variants.title"/>
                                <GSWidgetHeaderSubtitle>
                                    <Trans i18nKey="page.shopee.product.detail.variants.subTitle"/>
                                </GSWidgetHeaderSubtitle>
                            </GSWidgetHeader>
                            <GSWidgetContent >
                                <ShopeeEditProductVariantsTable
                                    variations={this.state.product.variations}
                                    models={this.state.gosellProduct.models}
                                    ref={this.refProdVariation}
                                    shopeeShop={this.state.shopeeSelectedItem.shop}
                                    syncPrice={this.state.syncPartList.includes(PRODUCT_SYNC_PART.PRICE)}
                                    syncStock={this.state.syncPartList.includes(PRODUCT_SYNC_PART.STOCK)}
                                    enabledStock={this.state.enabledStock}
                                    currency={this.defaultValue(ProductModelKey.CURRENCY, 0)}
                                />
                            </GSWidgetContent>
                        </GSWidget>}

                        {/*CATEGORY*/}
                        <GSWidget>
                            <GSWidgetHeader>
                                <GSTrans t={"component.product.addNew.productInformation.category"}/>
                            </GSWidgetHeader>
                            <GSWidgetContent>
                                <UikContentTitle>
                                    <Trans i18nKey="page.shopee.product.edit.category.title">
                                        Categories
                                    </Trans>
                                </UikContentTitle>

                                <DropdownTree ref={this.refProdCategory}
                                              categories={this.state.categories}
                                              categoryId={this.state.categoryId}
                                              onSelectCategory={this.onSelectCategory}
                                >
                                </DropdownTree>
                                { this.state.submitCategoryError &&
                                <AlertInline
                                    text={i18next.t(this.state.submitCategoryError)}
                                    type="error"
                                    nonIcon
                                />
                                }

                                {/*ATTRIBUTES*/}
                                {this.state.categoryId && this.state.shopeeSelectedItem &&
                                <ShopeeEditProductAttributeSelector categoryId={this.state.categoryId}
                                                                    shopeeShopId={this.state.shopeeSelectedItem.shopeeShopId}
                                                                    ref={this.refAttributeSelector}
                                                                    defaultValue={this.state.product.attributes}
                                                                    defaultBrand={this.state.product.brand}
                                />
                                }
                                {/*{this.state.isFetchingAttributes && <Loading style={LoadingStyle.DUAL_RING_GREY}/>}*/}
                                {/*{(this.state.attributesMandatory.length > 0 || this.state.attributesNonMandatory.length > 0) && !this.state.isFetchingAttributes &&*/}
                                {/*<UikContentTitle>*/}
                                {/*    <Trans i18nKey="page.shopee.product.detail.attributes.title"/>*/}
                                {/*</UikContentTitle>*/}
                                {/*}*/}

                                {/*<div hidden={!(this.state.attributesMandatory.length > 0 && !this.state.isFetchingAttributes)} >*/}
                                {/*    {*/}
                                {/*        this.renderAttributes(this.state.attributesMandatory, this.state.product.attributes.filter( attr => attr.isMandatory), true)*/}
                                {/*    }*/}
                                {/*</div>*/}

                                {/*<div hidden={!(this.state.isShowAllAttributes && !this.state.isFetchingAttributes)} >*/}
                                {/*    {this.renderAttributes(this.state.attributesNonMandatory, this.state.product.attributes.filter( attr => !attr.isMandatory), false)}*/}
                                {/*</div>*/}

                                {/*{this.state.attributesNonMandatory.length > 0 && !this.state.isFetchingAttributes &&*/}
                                {/*    <div className="collapse-attr-btn gs-atm__flex-col--flex-center gs-atm__flex-align-items--center">*/}
                                {/*        {!this.state.isShowAllAttributes?*/}
                                {/*            <>*/}
                                {/*                <FontAwesomeIcon icon={"chevron-down"} onClick={this.toggleAttributes}/>*/}
                                {/*                <Trans i18nKey="page.shopee.product.detail.attributes.subtitle"/>*/}
                                {/*            </>*/}
                                {/*            :*/}
                                {/*            <>*/}
                                {/*                <FontAwesomeIcon icon={"chevron-up"} onClick={this.toggleAttributes}/>*/}
                                {/*                <Trans i18nKey="page.shopee.product.detail.attributes.collapse"/>*/}
                                {/*            </>*/}
                                {/*        }*/}

                                {/*    </div>*/}
                                {/*}*/}
                            </GSWidgetContent>

                        </GSWidget>

                        {/*SHIPPING*/}
                        <GSWidget>
                            <GSWidgetHeader>
                                <Trans i18nKey="component.product.addNew.shipping.title">
                                    Shipping
                                </Trans>
                                <GSTooltip message={i18next.t('page.product.create.dimensionHint')}/>
                            </GSWidgetHeader>
                            <GSWidgetContent className="row">
                                {/*Weight*/}
                                <div className="pl-md-0 col-lg-3 col-md-3 col-sm-12">
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
                                        max_value={1000000}
                                        min_value={0}
                                        on_blur={(value) => this.onChangeDimension("weight", value)}
                                        default_value={
                                            this.defaultValueWithParent(
                                                ProductModelKey.SHIPPING_INFO, 'weight', 0)
                                        }
                                    />
                                </div>

                                {/*Length*/}
                                <div className="col-lg-3 col-md-3 col-sm-12">
                                    <Label for={'productLength'} className="gs-frm-control__title">
                                        <Trans i18nKey="component.product.addNew.shipping.length">
                                            Length
                                        </Trans>
                                    </Label>

                                    <CryStrapInput
                                        ref={this.refProdLength}
                                        name={'productLength'}
                                        thousandSeparator=","
                                        precision="0"
                                        unit={CurrencySymbol.CM}
                                        max_value={1000000}
                                        min_value={1}
                                        on_blur={(value) => this.onChangeDimension("length", value)}
                                        default_value={
                                            this.defaultValueWithParent(
                                                ProductModelKey.SHIPPING_INFO, 'length', 0
                                            )
                                        } />
                                </div>

                                {/*Width*/}
                                <div className="col-lg-3 col-md-3 col-sm-12">
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
                                        max_value={1000000}
                                        min_value={1}
                                        on_blur={(value) => this.onChangeDimension("width", value)}
                                        default_value={
                                            this.defaultValueWithParent(
                                                ProductModelKey.SHIPPING_INFO, 'width', 0
                                            )
                                        } />
                                </div>

                                {/*Height*/}
                                <div className="pr-md-0 col-lg-3 col-md-3 col-sm-12">
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
                                        max_value={1000000}
                                        min_value={1}
                                        on_blur={(value) => this.onChangeDimension("height", value)}
                                        default_value={
                                            this.defaultValueWithParent(
                                                ProductModelKey.SHIPPING_INFO, 'height', 0
                                            )
                                        } />
                                </div>
                            </GSWidgetContent>
                        </GSWidget>

                        {/*LOGISTICS*/}
                        {this.state.logistics.length > 0 &&
                            <GSWidget>
                                <GSWidgetHeader>
                                    <Trans i18nKey="page.shopee.product.detail.logistics.title"/>
                                    <GSWidgetHeaderSubtitle>
                                        <Trans i18nKey="page.shopee.product.detail.logistics.subTitle"/>
                                    </GSWidgetHeaderSubtitle>
                                </GSWidgetHeader>
                                <GSWidgetContent >
                                    <div className="logistics-container">
                                        {this.state.logistics.map( (logistic, index) => {
                                            return (
                                                <UikCheckbox
                                                    key={logistic.id} onClick={() => this.selectLogistic(logistic)}
                                                    label={
                                                        <span>
                                                            {logistic.name}
                                                                {!logistic.enabled &&
                                                                <GSTooltip icon={GSTooltipIcon.QUESTION_CIRCLE}
                                                                           message={i18next.t`page.shopee.product.logistic.disabledOnShopee`}
                                                                />
                                                                }
                                                                {logistic.enabled && !logistic.valid &&
                                                                <GSTooltip icon={"exclamation-triangle"} html={
                                                                    <>
                                                                        <strong>
                                                                            <GSTrans t="page.shopee.product.dimension.invalid"/>
                                                                        </strong>
                                                                        {logistic.errorMsgList &&
                                                                        logistic.errorMsgList.map(err => <div>{err}</div>)
                                                                        }
                                                                    </>
                                                                }/>
                                                                }
                                                        </span>
                                                    }
                                                    disabled={!logistic.enabled ||  !logistic.valid}
                                                    defaultChecked={this.state.logisticsSelected.findIndex(lo => lo.shopeeLogisticId === logistic.id && lo.enabled) > -1}
                                                />
                                            )
                                        })}
                                    </div>
                                </GSWidgetContent>
                                { this.state.submitLogisticError &&
                                    <AlertInline
                                        text={this.state.submitLogisticError}
                                        type="error"
                                        nonIcon
                                    />
                                }
                            </GSWidget>
                        }
                    </AvForm>
                </GSContentBody>
                }
            </GSContentContainer>
            </>
        );
    }
}


export class ImageView extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            isSetMainCoverShow: false,
            o9n: 1,
            imageObj: null,
            extension: 'jpg'

        }

        this.onRemoveCallback = this.props.onRemoveCallback
        this.onSelectCallback = this.props.onSelectCallback
        this.onMouseEnterImageView = this.onMouseEnterImageView.bind(this)
        this.onMouseLeaveImageView = this.onMouseLeaveImageView.bind(this)
        this.onClickSetMain = this.onClickSetMain.bind(this)
        this.createImageObject = this.createImageObject.bind(this)
        this.isValid = this.isValid.bind(this);


    }

    isValid() {
        if (this.props.validate && this.props.allowedExtensions) {
            return this.props.allowedExtensions.includes(this.state.extension)
        }
        return true
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
        if (typeof src === "string") {
            this.setState({ imageObj: src });
        }
        else if (src.urlPrefix) {
            this.setState({
                imageObj: ImageUtils.getImageFromImageModel(src),
                extension: src.extension || 'jpg'
            })
        } else {
            ImageUtils.getOrientation(this.props.src, (o9n => {
                this.setState({
                    o9n: o9n,
                    imageObj: URL.createObjectURL(this.props.src),
                    extension: FileUtils.getExtension(this.props.src)
                })
            }))
        }
    }

    render() {
        return (
            <div className={'image-view image-widget__image-item ' + (this.props.isMain ? 'image-widget__image-item--main' : '')}
                onMouseEnter={this.onMouseEnterImageView}
                onMouseLeave={this.onMouseLeaveImageView}
                 style={{
                     border: this.isValid()? '':'2px solid red !important'
                 }}
            >
                <a className="image-widget__btn-remove" onClick={() => { this.onRemoveCallback(this.props.arrIndex) }}>
                    <FontAwesomeIcon icon="times-circle" />
                </a>
                <img className={"photo " + 'photo--o9n-' + this.state.o9n}
                    width="137px"
                    height="137px"
                    src={this.state.imageObj} />
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

export function logisticValidate(shopeeLogistic, itemShippingInfo, extendedValidate) {
    let errorMsgList = [];
    const { length: itemLength,
        width: itemWidth,
        height: itemHeight,
        weight: itemWeight
    } = itemShippingInfo;
    const { length, width, height, maxWeight: lgMaxW, minWeight: lgMinW } = shopeeLogistic;

    const maxLength = length === 0 ? 1_000_000 : length;
    const minLength = 0;

    const maxWidth = width === 0 ? 1_000_000 : width;
    const minWidth = 0;

    const maxHeight = height === 0 ? 1_000_000 : height;
    const minHeight = 0;

    const maxWeight = lgMaxW === 0 ? 1_000_000 : lgMaxW;
    const minWeight = 0;

    let valid = true;
    if (!(itemLength >= minLength && itemLength <= maxLength)
        || !(itemHeight >= minHeight && itemHeight <= maxHeight)
        || !(itemWidth >= minWidth && itemWidth <= maxWidth)
        || !(itemWeight >= minWeight && itemWeight <= maxWeight)) {
        valid = false;
    }

    if (!(itemLength >= minLength && itemLength <= maxLength)) {
        errorMsgList.push(`${minLength}cm ≤ ${i18next.t`component.product.addNew.shipping.length`} ≤ ${maxLength}cm`);
    }
    if (!(itemHeight >= minHeight && itemHeight <= maxHeight)) {
        errorMsgList.push(`${minHeight}cm ≤ ${i18next.t`component.product.addNew.shipping.height`} ≤ ${maxHeight}cm`);
    }
    if (!(itemWidth >= minWidth && itemWidth <= maxWidth)) {
        errorMsgList.push(`${minWidth}cm ≤ ${i18next.t`component.product.addNew.shipping.width`} ≤ ${maxWidth}cm`);
    }
    if (!(itemWeight >= minWeight && itemWeight <= maxWeight)) {
        errorMsgList.push(`${minWeight}cm ≤ ${i18next.t`component.product.addNew.shipping.weight`} ≤ ${maxWeight}cm`);
    }

    if (extendedValidate) {
        valid = extendedValidate(itemShippingInfo);
    }
    return {
        valid,
        errorMsgList
    };
}


export function formatBeforeEditByAvField(value) {
    return value ? value.replace(/<p>/g, '').replace(/<\/p>/g, '\n').replace(/<br>/g, '\n') : '';
}

export function formatAfterEditByAvField(value) {
    value = StringUtils.removeEmoji(value)
    return value ? value.replace(/<p>/g, '').replace(/<\/p>/g, '<br>').replace(/\n/g, '<br>') : '';
}

export default ShopeeSyncEditProduct;
