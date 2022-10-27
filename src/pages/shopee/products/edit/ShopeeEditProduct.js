import React from "react";
import {
    UikButton,
    UikCheckbox,
    UikContentTitle,
    UikSelect,
} from "../../../../@uik";
import "./ShopeeEditProduct.sass";
import GSContentContainer from "../../../../components/layout/contentContainer/GSContentContainer";
import GSContentHeader from "../../../../components/layout/contentHeader/GSContentHeader";
import { Trans } from "react-i18next";
import { Breadcrumb, BreadcrumbItem } from "reactstrap";
import GSContentBody from "../../../../components/layout/contentBody/GSContentBody";
import { ItemService } from "../../../../services/ItemService";
import AvFieldCountable from "../../../../components/shared/form/CountableAvField/AvFieldCountable";
import { AvField, AvForm } from "availity-reactstrap-validation";
import Label from "reactstrap/es/Label";
import ImageUploader, {
    ImageUploadType,
} from "../../../../components/shared/form/ImageUploader/ImageUploader";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Dropzone from "react-dropzone";
import AlertInline from "../../../../components/shared/AlertInline/AlertInline";
import i18next from "../../../../config/i18n";
import CryStrapInput, {
    CurrencySymbol,
} from "../../../../components/shared/form/CryStrapInput/CryStrapInput";
import shopeeService from "../../../../services/ShopeeService";
import DropdownTree from "../../../../components/shared/DropdownTree/DropdownTree";
import { ImageUtils } from "../../../../utils/image";
import ShopeeEditProductVariantsTable from "./VariantsTable/ShopeeEditProductVariantsTable_1";
import Constants from "../../../../config/Constant";
import { GSToast } from "../../../../utils/gs-toast";
import { CurrencyUtils } from "../../../../utils/number-format";
import mediaService, {
    MediaServiceDomain,
} from "../../../../services/MediaService";
import LoadingScreen from "../../../../components/shared/LoadingScreen/LoadingScreen";
import { NAV_PATH } from "../../../../components/layout/navigation/Navigation";
import { RouteUtils } from "../../../../utils/route";
import $ from "jquery";
import GSButton from "../../../../components/shared/GSButton/GSButton";
import GSTrans from "../../../../components/shared/GSTrans/GSTrans";
import moment from "moment";
import DateRangePicker from "react-bootstrap-daterangepicker";
import GSWidget from "../../../../components/shared/form/GSWidget/GSWidget";
import GSWidgetHeader from "../../../../components/shared/form/GSWidget/GSWidgetHeader";
import GSWidgetContent from "../../../../components/shared/form/GSWidget/GSWidgetContent";
import GSWidgetHeaderSubtitle from "../../../../components/shared/form/GSWidget/GSWidgetHeaderSubtitle";
import GSTooltip, {
    GSTooltipIcon,
} from "../../../../components/shared/GSTooltip/GSTooltip";
import ConfirmModal from "../../../../components/shared/ConfirmModal/ConfirmModal";
import { StringUtils } from "../../../../utils/string";
import { FileUtils } from "../../../../utils/file";
import ShopeeEditProductAttributeSelector, {BRAND_ATTR_ID} from "./ShopeeEditProductAttributeSelector/ShopeeEditProductAttributeSelector";
import _ from 'lodash';

const ProductModelKey = {
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
};

const DATE_RANGE_LOCATE_CONFIG = {
    UI_DATE_FORMAT: "DD-MM-YYYY",
    SERVER_DATE_FORMAT: "YYYY-MM-DD",
    format: "DD-MM-YYYY",
    applyLabel: i18next.t("component.order.date.range.apply"),
    cancelLabel: i18next.t("component.order.date.range.cancel")
}
class ShopeeEditProduct extends React.Component {
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
            dropdownOpen: false,
            categories: [],
            lstCategorySelected: [],
            logistics: [],
            logisticsSelected: [],
            isFetching: true,
            isCollapsed: true,
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
            shopeeSelectedShop: undefined,
            enabledStock: false
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
        this.refConfirmModal = React.createRef();
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
        //this.validationLogistics = this.validationLogistics.bind(this);
        // this.logisticFilter = this.logisticFilter.bind(this);
        this.checkLWHWE = this.checkLWHWE.bind(this);
        this.handleInvalidSubmit = this.handleInvalidSubmit.bind(this);
        this.formatAfterEditByAvField = this.formatAfterEditByAvField.bind(this);
        this.selectDate = this.selectDate.bind(this);
        this.fetchShopeeShopListAndLogistic = this.fetchShopeeShopListAndLogistic.bind(this);
        this.onChangeShopeeShop = this.onChangeShopeeShop.bind(this);
        this.fetchLogistic = this.fetchLogistic.bind(this);
        this.validateLogistic = this.validateLogistic.bind(this);
        this.unCheckLogistic = this.unCheckLogistic.bind(this);
        this.resolveStockQuantity = this.resolveStockQuantity.bind(this);
        this.initShopeeSetting = this.initShopeeSetting.bind(this);
        this.resolveSKU = this.resolveSKU.bind(this);
        this.formatBeforeEditByAvField = this.formatBeforeEditByAvField.bind(this);
    }

    initShopeeSetting() {
        shopeeService.loadShopeeSetting()
            .then(shopeeShop => {
                const {settingObject} = shopeeShop
                const enabledStock = !settingObject.autoSynStock // enabled if autoSynStock is disable
                this.setState({
                    enabledStock
                })
            })
    }

    fetchShopeeShopListAndLogistic() {
        // get connected account but not linked yet

        shopeeService.getConnectedShops()
            .then(accountList => {
                let mergedAccountList = [...accountList]
                shopeeService.getLinkedItems(this.state.itemId)
                    .then(itemList => {

                        mergedAccountList = mergedAccountList.filter(acc => {
                            if (itemList.find(spItem => spItem.shopeeShopId == acc.shopId)) return false; // already sync
                            return true
                        })

                        this.setState({
                            shopeeSelectedShop: mergedAccountList[0]? mergedAccountList[0]:undefined,
                            shopeeSelectedShopId: mergedAccountList[0]? mergedAccountList[0].id:undefined,
                            shopeeShopList: mergedAccountList.map(acc => ({label: acc.shopName, value: acc.id, shop: acc}))
                        })

                        this.fetchLogistic(mergedAccountList[0]? mergedAccountList[0].id:undefined)

                    })

            })
    }

    componentWillUnmount() {
    }

    formatBeforeEditByAvField(value) {
        let processBr = value ? value.replace(/<p>/g, '').replace(/<\/p>/g, '\n').replace(/<br>/g, '\n') : '';
        return StringUtils.htmlToPlainText(processBr)
    }



    async componentDidMount() {
        this._isMounted = true

        if (this._isMounted) {
            this.setState({
                isFetching: true
            })
        }

        // this.fetchProductById(this.state.itemId);
        // this.getCategories();
        try {
            this.initShopeeSetting()
            // get shopee accounts first
            this.fetchShopeeShopListAndLogistic()


            this.pmProduct = ItemService.fetch(this.state.itemId)
            this.pmCategories = shopeeService.getCategories()

            const [resProduct, resCate] = await Promise.all([this.pmProduct, this.pmCategories])
            if (resProduct.description) {
                let text = $('<div>' + resProduct.description.replace(/<p>/g, '').replace(/<\/p>/g, '\n').replace(/<br>/g, '\n') + '</div>').text();
                if (text && text !== '') {
                    resProduct.description = text.replace('Powered by Froala Editor', '');
                }
            }



            this.setState({
                product: resProduct,
                productImages: resProduct.images.slice(0, this.IMAGE_MAX_LENGTH),
                shippingInfo: resProduct,
                categories: resCate,
                isFetching: false
            });

        } catch (e) {
            // redirect to shopee account
            RouteUtils.redirectWithoutReload(this.props, NAV_PATH.shopeeAccount)
        }

    }


    defaultValue(key, defaultV) {
        if (Object.keys(this.state.product).length === 0 && this.state.product.constructor === Object)
            return defaultV;
        return this.state.product[key];

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
        //logistic.logistic_id = logistic.id;

        let lstSelected = this.state.logisticsSelected;
        let existIndex = lstSelected.findIndex(lo => lo.id == logistic.id);
        
        if(existIndex === -1){ // new logistic -> check
            lstSelected.push(logistic);
        }else{ // existed -> unCheck
            lstSelected.splice(existIndex, 1);
        }
        this.setState({logisticsSelected : lstSelected});

        if(lstSelected && lstSelected.length > 0){
            this.setState({submitLogisticError : ''});
        }
    }

    unCheckLogistic(logistic) {
        //logistic.logistic_id = logistic.id;

        let lstSelected = this.state.logisticsSelected;
        let existIndex = lstSelected.findIndex(lo => lo.id == logistic.id);

        if(existIndex !== -1){ // new logistic -> check
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

    handleInvalidSubmit(event, errors, values){
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


    handleValidSubmit(event, values){

        // loading
        this.setState({
            isSaving : true,
            submitCategoryError : '',
            submitLogisticError: ''
        });

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

        let hasVariation = variations.length > 0 ? true : false;

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
                (img.urlPrefix) && lstImageTotal.push({
                    url: ImageUtils.getImageFromImageModel(img)
                });
            });

            // swap image
            let mainImage = lstImageTotal[this.state.prodImageMain];
            lstImageTotal.splice(this.state.prodImageMain, 1);
            lstImageTotal.unshift(mainImage);

            //-------------------------------//
            // request
            //-------------------------------//
            let request = {
                bc_item_id : this.state.product.id,
                category_id : this.state.categoryId,
                name : values["productName"],
                description : this.formatAfterEditByAvField(values["productDescription"]),
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
                images : lstImageTotal.map(img => img.url),
                has_variation : tier_variations.length > 0 && hasVariation ? true : false,
                tier_variation : tier_variations,
                variation : hasVariation ? variations : null,
                brand: brand
            }

            shopeeService.syncNewProduct(request, this.state.shopeeSelectedShop.shopId).then(res => {
                if (this.state.shopeeShopList.length > 1) {
                    //Sau khi nó create product lên shopee ok thì show popup (trường hợp có nhiều accounts cần create)
                    const self = this

                    return new Promise(resolve => {
                        self.refConfirmModal.openModal({
                            modalTitle: i18next.t('page.shopee.product.edit.syncMore.title'),
                            messages: i18next.t('page.shopee.product.edit.syncMore'),
                            okCallback: () => {
                                location.reload()
                            },
                            cancelCallback: () => {
                                resolve(true)
                            }
                        })
                    })
                }

                return Promise.resolve(true)
            })
                .then(isRedirect => {
                    if (isRedirect) {
                        //Nếu chỉ có 1 account thì tạo xong quay về Product list GoSELL
                        this.setState({
                            isSaving : false,
                            redirectPageConfirm : false
                        });
                        GSToast.commonCreate()
                        RouteUtils.redirectWithoutReload(this.props, NAV_PATH.products);

                    }
                })
                .catch(e => {
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

            });

        }).catch(e => {
            // get image fail
            console.log(e)
            this.setState({isSaving : false});
            GSToast.commonError();
        });
    }

    renderQuantitative(attr){
        return (
            <div className="col-6" style={{paddingRight: "0px"}} key={'attr_' + attr.attribute_id + '_row_quantitative'}>
                                        <Label for={'attr-'+attr.attribute_name} className="gs-frm-control__title">
                                        &nbsp;
                                        </Label>
                                        <AvField 
                                            type="select"
                                            name={'attr_quantitative_'+attr.attribute_id}
                                            value={attr.unit_list[0]}
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

    renderAttributes(attributes , required) {
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

            let timeValue; 
            if(attr.input_type === 'TEXT_FILED' && attr.attribute_type === 'TIMESTAMP_TYPE'){
                
                let exist = this.lstSpecialAttr.find(data => data.id === 'attr_' + attr.attribute_id);

                // if exist -> get from exit
                if(exist){
                    timeValue = moment(exist.value, DATE_RANGE_LOCATE_CONFIG.UI_DATE_FORMAT);
                }else{
                    timeValue = moment();
                    this.lstSpecialAttr.push({id: 'attr_' + attr.attribute_id, value: timeValue.format(DATE_RANGE_LOCATE_CONFIG.UI_DATE_FORMAT)});
                }
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
                                    />
                                </div>

                                {/* For quantitative */}
                                {
                                    'QUANTITATIVE' === attr.format_type &&
                                    this.renderQuantitative(attr)
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
                                    />
                                </div>

                                {/* For quantitative */}
                                {
                                    'QUANTITATIVE' === attr.format_type &&
                                    this.renderQuantitative(attr)
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
                                        validate={{
                                            required: {value: required, errorMessage: i18next.t('common.validation.required')},
                                            maxLength: { value: 40, errorMessage: i18next.t("common.validation.char.max.length", { x: 40 }) }
                                        }} 
                                    />
                                </div>

                                {/* For quantitative */}
                                {
                                    'QUANTITATIVE' === attr.format_type &&
                                    this.renderQuantitative(attr)
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
                                        startDate={timeValue}
                                    >
                                        <input type="text" 
                                            id={'attr_'+attr.attribute_id}
                                            onChange={() => {}} 
                                            value={timeValue.format(DATE_RANGE_LOCATE_CONFIG.UI_DATE_FORMAT)} 
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
                                //value={attr.options[0]}
                                validate={{
                                    required: {value: required, errorMessage: i18next.t('common.validation.required')},
                                    maxLength: { value: 40, errorMessage: i18next.t("common.validation.char.max.length", { x: 40 }) }
                                }} 
                            >
                                <option key={'attr_'+attr.attribute_id + '_00'} value={''}>
                                    
                                </option>
                                {attr.options.map( (opt, index) => {
                                    return (
                                        
                                
                                        <option key={'attr_'+attr.attribute_id + opt + index} value={opt}>
                                            {attr.values[index].translate_value? attr.values[index].translate_value:attr.values[index].original_value}
                                        </option>
                                        
                                    )
                                })}
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

    formatAfterEditByAvField(value) {
        value = StringUtils.removeEmoji(value)

        return value ? value.replace(/<p>/g, '').replace(/<\/p>/g, '<br>').replace(/\n/g, '<br>') : '';
    }

    onChangeShopeeShop(option) {
        const shopId = option.value
        const shop = option.shop
        this.setState({
            shopeeSelectedShopId: shopId,
            shopeeSelectedShop: shop
        })
        this.fetchLogistic(shopId)
    }

    fetchLogistic(shopId) {
        this.setState({
            isFetching: true
        })
        shopeeService.getLogistics(shopId)
            .then(resLgt => {
                this.setState({
                    logistics: resLgt.logistics.map( lgt => { return {...lgt, self: false}}),
                }, () => {
                    this.validateLogistic()
                })
            })
    }

    resolveStockQuantity() {
        const currentShop = this.state.shopeeSelectedShop
        if (currentShop && this.state.product) {
            const {branchId} = currentShop
            const productBranchList = this.state.product.branches
            const productMatchedBranch = productBranchList.find(branch => branch.branchId == branchId)
            if (productMatchedBranch) {
                return productMatchedBranch.totalItem
            }
        }
        return 0
    }
    resolveSKU() {
        const currentShop = this.state.shopeeSelectedShop
        if (currentShop && this.state.product) {
            const {branchId} = currentShop
            const productBranchList = this.state.product.branches
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
            <ConfirmModal ref={el => this.refConfirmModal = el}/>
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
                                   value={[{value: this.state.shopeeSelectedShopId}]}
                                   className="ml-2"
                                   onChange={this.onChangeShopeeShop}
                        />
                    </div>


                    <GSButton secondary outline onClick={() => RouteUtils.linkTo(this.props, NAV_PATH.shopeeProduct)}>
                        <Trans i18nKey="common.btn.cancel" className="sr-only">
                            Cancel
                        </Trans>
                    </GSButton>
                    <GSButton success className="btn-save" marginLeft onClick={this.fireSubmitForm} >
                        <Trans i18nKey="common.btn.create" className="sr-only">
                            Create
                        </Trans>
                    </GSButton>
                </GSContentHeader>
                {!this.state.isFetching &&
                <GSContentBody size={GSContentBody.size.LARGE}>
                    {!this.state.isValidForm &&
                    <div className="alert alert-danger product-form__alert product-form__alert--error" role="alert">
                        <Trans i18nKey="component.product.edit.invalidate"/>
                    </div>
                    }
                    <AvForm onValidSubmit={this.handleValidSubmit} onInvalidSubmit={this.handleInvalidSubmit} autoComplete="off">

                        {/*PRODUCT INFO*/}
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
                                        <label>{this.state.product.name}</label>
                                        <p>{this.state.product.orgPrice > this.state.product.newPrice
                                            ? CurrencyUtils.formatMoneyByCurrency(this.state.product.newPrice, this.state.product.currency) + " ~ " + CurrencyUtils.formatMoneyByCurrency(this.state.product.orgPrice, this.state.product.currency)
                                            : this.state.product.orgPrice < this.state.product.newPrice
                                                ? CurrencyUtils.formatMoneyByCurrency(this.state.product.orgPrice, this.state.product.currency) + " ~ " + CurrencyUtils.formatMoneyByCurrency(this.state.product.newPrice, this.state.product.currency)
                                                : CurrencyUtils.formatMoneyByCurrency(this.state.product.orgPrice, this.state.product.currency)
                                        }
                                        </p>
                                    </span>
                                    <span className={"btn-more-info"} onClick={this.toggleMoreInfo}>
                                        {this.state.isCollapsed &&
                                        <FontAwesomeIcon className="collapse-expand" icon={"plus-circle"}/>}
                                        {!this.state.isCollapsed &&
                                        <FontAwesomeIcon className="collapse-expand" icon={"minus-circle"}/>}
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
                                            Below information are linked with respective product. You can edit before
                                            syncing to Shopee,
                                            but the link will be broken, further updates to GoSell product might not
                                            update to Shopee.
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
                                        value={this.state.product.name}
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
                                        value={this.formatBeforeEditByAvField(this.state.product.description)}
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
                                </Trans>3
                            </GSWidgetHeader>
                            <GSWidgetContent className={this.state.isSaving ? 'gs-atm--disable' : ''}>
                                <div className="image-drop-zone" hidden={this.state.productImages.length > 0}>
                                    <Dropzone onDrop={file => this.onImageUploaded(file)}>
                                        {({getRootProps, getInputProps}) => (
                                            <section>
                                                <div {...getRootProps()}>
                                                    <input {...getInputProps()}
                                                           accept={ImageUploadType.JPEG + ',' + ImageUploadType.PNG}/>
                                                    <p><FontAwesomeIcon icon={'upload'}
                                                                        className="image-drop-zone__icon"/></p>
                                                    <p>
                                                        <GSTrans t="component.product.addNew.images.dragAndDrop"
                                                                 values={{maxSize: this.IMAGE_MAX_SIZE_BY_MB}}>
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
                                                key={(item.id ? item.id : item.name) + index}
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
                        {this.state.product.models && this.state.product.models.length === 0 &&
                        <GSWidget>
                            <GSWidgetHeader>
                                <Trans i18nKey="page.product.create.pricing">
                                    Pricing
                                </Trans>
                            </GSWidgetHeader>
                            <GSWidgetContent className="row">

                                <div className="pl-0 col-lg-6 col-md-6 col-sm-12">
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
                                        unit={this.state.product.currency}
                                        default_value={
                                            this.state.product.newPrice ? this.state.product.newPrice : this.state.product.orgPrice
                                        }
                                        min_value={0}
                                        max_value={100000000}
                                        on_change_callback={this.onChangePrice}
                                        position={CurrencyUtils.isPosition(this.state.product.currency)}
                                        precision={CurrencyUtils.isCurrencyInput(this.state.product.currency) && '2'}
                                        decimalScale={CurrencyUtils.isCurrencyInput(this.state.product.currency) && 2}
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
                                        <Label for={'productSKU'} className="gs-frm-control__title">SKU (Stock keeping
                                            unit)</Label>
                                        <AvField
                                            onChange={(e, v) => {
                                                this.ipSku = v
                                            }}
                                            value={this.resolveSKU()}
                                            name={'productSKU'}
                                            validate={{
                                                minLength: {
                                                    value: 1,
                                                    errorMessage: i18next.t("common.validation.char.min.length", {x: 1})
                                                },
                                                maxLength: {
                                                    value: 100,
                                                    errorMessage: i18next.t("common.validation.char.max.length", {x: 100})
                                                }
                                            }}
                                        />
                                    </div>

                                    {/*Quantity*/}
                                    {this.state.product.models.length === 0 &&
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
                        {this.state.product.models.length > 0 &&
                        <GSWidget>
                            <GSWidgetHeader>
                                <Trans i18nKey="page.shopee.product.detail.variants.title"/>
                                <GSWidgetHeaderSubtitle>
                                    <Trans i18nKey="page.shopee.product.detail.variants.subTitle"/>
                                </GSWidgetHeaderSubtitle>
                            </GSWidgetHeader>
                            <GSWidgetContent>
                                <ShopeeEditProductVariantsTable models={this.state.product.models}
                                                                ref={this.refProdVariation}
                                                                currency={this.state.product.currency}
                                                                shopeeShop={this.state.shopeeSelectedShop}
                                                                enabledStock={this.state.enabledStock}
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
                                {this.state.submitCategoryError &&
                                <AlertInline
                                    text={i18next.t(this.state.submitCategoryError)}
                                    type="error"
                                    nonIcon
                                />
                                }

                                {/*ATTRIBUTES*/}
                                {this.state.categoryId && this.state.shopeeSelectedShop &&
                                    <ShopeeEditProductAttributeSelector categoryId={this.state.categoryId}
                                                                        shopeeShopId={this.state.shopeeSelectedShop.shopId}
                                                                        ref={this.refAttributeSelector}
                                    />
                                }

                            </GSWidgetContent>
                        </GSWidget>
                        {/*DIMENSION*/}
                        <GSWidget className="gs-widget">
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
                                            }/>
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
                                            }/>
                                    </div>

                                    {/*Height*/}
                                    <div className="pr-md-0  col-lg-3 col-md-3 col-sm-12">
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
                                            }/>
                                    </div>
                            </GSWidgetContent>


                        </GSWidget>
                        {/*LOGISTICS*/}
                        {this.state.logistics.length > 0 &&
                        <GSWidget>
                            <GSWidgetHeader subTitle={<Trans i18nKey="page.shopee.product.detail.logistics.subTitle"/>}>
                                <Trans i18nKey="page.shopee.product.detail.logistics.title"/>
                            </GSWidgetHeader>
                            <GSWidgetContent>
                                <div className="logistics-container">
                                    {this.state.logistics.map((logistic, index) => {
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
                                                disabled={!logistic.enabled || !logistic.valid}
                                            />
                                        )
                                    })}
                                </div>
                            </GSWidgetContent>
                            {this.state.submitLogisticError &&
                            <AlertInline
                                text={this.state.submitLogisticError}
                                type="error"
                                nonIcon
                            />
                            }
                        </GSWidget>}
                    </AvForm>
                </GSContentBody>}
            </GSContentContainer>
            </>
        );
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

    validateLogistic() {
        const lgList = [...this.state.logistics]
        lgList.forEach(lg => {
            let extendedValidate
            if (lg.id === Constants.LogisticCode.Shopee.GIAO_HANG_TIET_KIEM) {
                extendedValidate = (logistic, {length, width, height}) => (
                    length * width * height < 60000
                )
            }
            const {valid, errorMsgList} = this.logisticValidate(lg, this.state.product.shippingInfo, extendedValidate)
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

    logisticValidate(shopeeLogistic, itemShippingInfo, extendedValidate) {
        let valid = true
        let errorMsgList = []

        if (!itemShippingInfo) return {
            valid, errorMsgList
        }
        const {length: itemLength,
            width: itemWidth,
            height: itemHeight,
            weight: itemWeight
        } = itemShippingInfo
        const {length, width, height, maxWeight: lgMaxW, minWeight: lgMinW} = shopeeLogistic;

        const maxLength = length === 0? 1_000_000:length;
        const minLength = 0;

        const maxWidth = width === 0? 1_000_000:width;
        const minWidth = 0;

        const maxHeight = height === 0? 1_000_000:height;
        const minHeight = 0;

        const maxWeight = lgMaxW === 0? 1_000_000:lgMaxW;
        const minWeight = 0;

        if (!(itemLength >= minLength && itemLength <= maxLength)
            || !(itemHeight >= minHeight && itemHeight<=maxHeight)
            || !(itemWidth >= minWidth && itemWidth <= maxWidth)
            || !(itemWeight >= minWeight && itemWeight <= maxWeight)) {
            valid = false
        }

        if (!(itemLength >= minLength && itemLength <= maxLength)) {
            errorMsgList.push(`${minLength}cm ≤ ${i18next.t`component.product.addNew.shipping.length`} ≤ ${maxLength}cm`)
        }
        if (!(itemHeight >= minHeight && itemHeight <= maxHeight)) {
            errorMsgList.push(`${minHeight}cm ≤ ${i18next.t`component.product.addNew.shipping.height`} ≤ ${maxHeight}cm`)
        }
        if (!(itemWidth >= minWidth && itemWidth <= maxWidth)) {
            errorMsgList.push(`${minWidth}cm ≤ ${i18next.t`component.product.addNew.shipping.width`} ≤ ${maxWidth}cm`)
        }
        if (!(itemWeight >= minWeight && itemWeight <= maxWeight)) {
            errorMsgList.push(`${minWeight}cm ≤ ${i18next.t`component.product.addNew.shipping.weight`} ≤ ${maxWeight}cm`)
        }

        if (extendedValidate) {
            valid =  extendedValidate(shopeeLogistic, itemShippingInfo);
        }
        return {
            valid,
            errorMsgList
        }
    }


    checkLWHWE(l, lMin, lMax, w, wMin, wMax, h, hMin, hMax, we, weMin, weMax) {
        if (!(l >= lMin && l <= lMax) || !(h >= hMin && h<=hMax) || !(w >= wMin && w <= wMax) || !(we >= weMin && we <= weMax)) {
            return false
        }
        return true
    }
}


class ImageView extends React.Component {
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
        if (src.urlPrefix) {
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

    isValid() {
        if (this.props.validate && this.props.allowedExtensions) {
            return this.props.allowedExtensions.includes(this.state.extension)
        }
        return true
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
                    <FontAwesomeIcon icon="times-circle">

                    </FontAwesomeIcon>
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


export default ShopeeEditProduct;
