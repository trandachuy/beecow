import React, {useEffect, useRef, useState} from 'react'
import {
    UikButton,
    UikContentTitle,
    UikHeadline,
    UikHeadlineDesc,
    UikWidget,
    UikWidgetContent,
    UikWidgetHeader
} from '../../../../@uik'
import './TikiEditProduct.sass'
import GSContentContainer from "../../../../components/layout/contentContainer/GSContentContainer"
import GSContentHeader from "../../../../components/layout/contentHeader/GSContentHeader"
import {Trans} from "react-i18next"
import {Breadcrumb, BreadcrumbItem} from 'reactstrap'
import GSContentBody from "../../../../components/layout/contentBody/GSContentBody"
import {ItemService} from "../../../../services/ItemService"
import AvFieldCountable from "../../../../components/shared/form/CountableAvField/AvFieldCountable"
import {AvField, AvForm} from 'availity-reactstrap-validation'
import Label from "reactstrap/es/Label"
import ImageUploader, {ImageUploadType} from "../../../../components/shared/form/ImageUploader/ImageUploader"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import Dropzone from "react-dropzone"
import AlertInline from "../../../../components/shared/AlertInline/AlertInline"
import i18next from "../../../../config/i18n"
import tikiService from '../../../../services/TikiService'
import DropdownTree from '../../../../components/shared/DropdownTree/DropdownTree'
import {ImageUtils} from "../../../../utils/image"
import TikiEditProductVariantsTable from "./VariantsTable/TikiEditProductVariantsTable_1"
import {GSToast} from "../../../../utils/gs-toast"
import Loading, {LoadingStyle} from "../../../../components/shared/Loading/Loading"
import {CurrencyUtils} from "../../../../utils/number-format"
import mediaService, {MediaServiceDomain} from "../../../../services/MediaService"
import LoadingScreen from "../../../../components/shared/LoadingScreen/LoadingScreen"
import {NAV_PATH} from '../../../../components/layout/navigation/Navigation'
import {RouteUtils} from '../../../../utils/route'
import $ from 'jquery'
import GSButton from "../../../../components/shared/GSButton/GSButton"
import GSTrans from "../../../../components/shared/GSTrans/GSTrans"
import Constants from "../../../../config/Constant";
import DropdownBox from "../../../../components/shared/GSCallHistoryTable/SearchDropdown/DropdownBox";
import GSEditor from "../../../../components/shared/GSEditor/GSEditor";
import CryStrapInput, {CurrencySymbol} from "../../../../components/shared/form/CryStrapInput/CryStrapInput";
import {FormValidate} from "../../../../config/form-validate";
import {CredentialUtils} from "../../../../utils/credential";

const PRODUCT_KEY = {
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
const INVENTORY_VALUES = {
    INSTOCK: 'instock',
    BACK_ORDER: 'backorder',
    SELLER_BACK_ORDER: 'seller_backorder',
    DROP_SHIP: 'drop_ship',
}
const INVENTORY_TYPES = [
    {value: INVENTORY_VALUES.INSTOCK, label: i18next.t('page.tiki.inventory.Type.status.instock')},
    {value: INVENTORY_VALUES.BACK_ORDER, label: i18next.t('page.tiki.inventory.Type.status.backorder')},
    {value: INVENTORY_VALUES.SELLER_BACK_ORDER, label: i18next.t('page.tiki.inventory.Type.status.seller_backorder')},
    {value: INVENTORY_VALUES.DROP_SHIP, label: i18next.t('page.tiki.inventory.Type.status.drop_ship')}
]
const INVENTORY_OPTIONS = {
    INVENTORY_TYPE: 'inventoryType',
    SUPPLIER: 'supplier',
}

const IMAGE_MAX_LENGTH = 9
const IMAGE_MAX_SIZE_BY_MB = 2

const TikiEditProduct = (props) => {
    const [stProduct, setStProduct] = useState({})
    const [stIsSaving, setStIsSaving] = useState(false)
    const [stProductImages, setStProductImages] = useState([])
    const [stProdImageMain, setStProdImageMain] = useState(0)
    const [stCategories, setStCategories] = useState([])
    const [stIsFetching, setStIsFetching] = useState(true)
    const [stIsCollapsed, setStIsCollapsed] = useState(true)
    const [stAttributesMandatory, setStAttributesMandatory] = useState([])
    const [stAttributesNonMandatory, setStAttributesNonMandatory] = useState([])
    const [stIsFetchingAttributes, setStIsFetchingAttributes] = useState(false)
    const [stIsShowAllAttributes, setStIsShowAllAttributes] = useState(false)
    const [stCategoryId, setStCategoryId] = useState(null)
    const [stSubmitCategoryError, setStSubmitCategoryError] = useState(null)
    const [stIsValidForm, setStIsValidForm] = useState(true)
    const [stRedirectPageConfirm, setStRedirectPageConfirm] = useState(true)
    const [stInventory, setStInventory] = useState({
        [INVENTORY_OPTIONS.INVENTORY_TYPE]: INVENTORY_VALUES.INSTOCK,
        [INVENTORY_OPTIONS.SUPPLIER]: null,
    })
    const [stSuppliers, setStSuppliers] = useState([])
    const [stIsHiddenSupplierSelector, setStIsHiddenSupplierSelector] = useState(true)
    const [stIsDimensionImageError, setStIsDimensionImageError] = useState(false)
    const [stProductPrice, setStProductPrice] = useState(null)

    const hasEditMode = () => {
        return props.match.path === (NAV_PATH.tikiEditProduct + "/:itemId")
    }
    const getModeConfig = (isEditMode) => ({
        getSyncProductDetail: isEditMode,
        disableName: isEditMode,
        disableDescription: isEditMode,
        disableCategory: isEditMode,
        hiddenCategory: isEditMode,
        disableAttribute: isEditMode,
        disableInventoryType: isEditMode,
        disableSupplier: isEditMode,
        hasEditMarketPrice: isEditMode,
        hasEditNewPrice: isEditMode,
        hiddenMarketPrice: !isEditMode,
        hiddenNewPrice: !isEditMode,
        hasEditQuantity: null,
        hiddenQuantity: isEditMode,
        hasEditSKU: isEditMode,
        hiddenSKU: !isEditMode,
    })

    const [stEditModeController, setStEditModeController] = useState(getModeConfig(hasEditMode()))

    const refSubmitFrom = useRef(null)
    const refProdVariation = useRef(null)
    const refProdPrice = useRef(null)
    const refProdDiscount = useRef(null)
    const refProdStock = useRef(null)
    const refProdSKU = useRef(null)

    useEffect(() => {
        setStIsFetching(true)
        fetchData()
    }, [])

    useEffect(() => {
        const isHidden = stInventory[INVENTORY_OPTIONS.INVENTORY_TYPE] === INVENTORY_VALUES.INSTOCK

        setStIsHiddenSupplierSelector(isHidden)
        setStEditModeController(editModeController => ({
            ...editModeController,
            hasEditQuantity: hasEditMode() && stInventory[INVENTORY_OPTIONS.INVENTORY_TYPE] !== INVENTORY_VALUES.INSTOCK,
        }))
    }, [stInventory[INVENTORY_OPTIONS.INVENTORY_TYPE]])

    useEffect(() => {
        setStIsDimensionImageError(false)

        stProductImages.forEach(file => {
            const reader = new FileReader();
            const img = new Image();

            reader.addEventListener("load", () => {
                // convert image file to base64 string
                img.src = reader.result;
            }, false);
            img.onload = function () {
                // only for tiki, minimum dimensions must be 500 x 500 pixels
                if (this.width < 500 || this.height < 500) {
                    setStIsDimensionImageError(true)
                }
            };

            if (file) {
                if (file instanceof File) {
                    reader.readAsDataURL(file)
                } else if (file.imageId) {
                    img.src = file.urlPrefix + '/' + file.imageId + '.jpg'
                }
            }
        })
    }, [stProductImages])

    useEffect(() => {
        if (stSuppliers.length && stInventory[INVENTORY_OPTIONS.INVENTORY_TYPE] && !stInventory[INVENTORY_OPTIONS.SUPPLIER]) {
            setStInventory(inventory => ({
                ...inventory,
                [INVENTORY_OPTIONS.SUPPLIER]: stSuppliers[0].value
            }))
        }
    }, [stSuppliers])

    useEffect(() => {
        if (_.isEmpty(stProduct)) {
            return
        }
        const hasModel = stProduct[PRODUCT_KEY.MODELS].length

        setStEditModeController(editModeController => ({
            ...editModeController,
            hasEditSKU: !hasModel,
            hasEditQuantity: !hasModel,
            hasEditMarketPrice: !hasModel,
            hasEditNewPrice: !hasModel,
        }))
    }, [stProduct])

    useEffect(() => {
        refProdDiscount.current && refProdDiscount.current.isValid()
    }, [stProductPrice])

    const fetchData = () => {
        const itemId = props.match.params.itemId
        const pmProduct = ItemService.fetch(itemId)
        const pmSyncProductDetail = stEditModeController.getSyncProductDetail && tikiService.getItemDetailForSyncUpdate(itemId)
        const pmCategories = tikiService.getCategories({'parent.equals': 2})
        const pmSuppliers = tikiService.getAllSuppliers()

        Promise.all([pmProduct, pmSyncProductDetail, pmCategories, pmSuppliers])
            .then(([product, syncProductDetail, categories, suppliers]) => {
                if (syncProductDetail) {
                    //map tkItemId from tiki item to product
                    product.tkItemId = syncProductDetail.tkItemId
                    product.originalSku = syncProductDetail.sku
                    product.orgPrice = syncProductDetail.marketPrice
                    product.newPrice = syncProductDetail.price
                    product.name = syncProductDetail.name
                    product.description = syncProductDetail.description
                    product.totalItem = syncProductDetail.quantity
                    product.images = syncProductDetail.images.map(image => {
                        const imagePaths = image.url.split('/')
                        const prefix = imagePaths.slice(0, imagePaths.length - 1).join('/')
                        const id = imagePaths[imagePaths.length - 1].split('.')[0]

                        return {
                            id: image.id,
                            urlPrefix: prefix,
                            rank: image.id,
                            imageId: id,
                            imageUUID: id,
                        }
                    })
                    product.models = syncProductDetail.variants.map(variant => ({
                        id: variant.id,
                        tkVariantId: variant.tkVariantId,
                        name: variant.name,
                        orgName: variant.name,
                        label: variant.label,
                        sku: variant.originalSku,
                        orgPrice: variant.price,
                        newPrice: variant.marketPrice,
                        totalItem: variant.quantity,
                        imagePosition: variant.imageRank
                    }))

                    setStInventory({
                        [INVENTORY_OPTIONS.INVENTORY_TYPE]: syncProductDetail.inventoryType,
                        [INVENTORY_OPTIONS.SUPPLIER]: syncProductDetail.supplier,
                    })
                }

                if (product[PRODUCT_KEY.DESCRIPTION]) {
                    let text = $('<div>' + product[PRODUCT_KEY.DESCRIPTION].replace(/<p>/g, '').replace(/<\/p>/g, '\n').replace(/<br>/g, '\n') + '</div>').text()

                    if (text && text !== '') {
                        product[PRODUCT_KEY.DESCRIPTION] = text.replace('Powered by Froala Editor', '')
                    }
                }

                //map image object into model
                product[PRODUCT_KEY.MODELS] = product[PRODUCT_KEY.MODELS].map((model, index) => {
                    const imageObject = product[PRODUCT_KEY.IMAGES][model.imagePosition]

                    return {
                        ...model,
                        image: imageObject ? imageObject.urlPrefix + "/" + imageObject.imageId + '.jpg' : null,
                    }
                })

                //need to validate new price
                setStProductPrice(product[PRODUCT_KEY.ORG_PRICE] || product[PRODUCT_KEY.NEW_PRICE])

                setStProduct(product)
                setStProductImages(product[PRODUCT_KEY.IMAGES].slice(0, IMAGE_MAX_LENGTH))
                setStCategories(formatCategories(categories))
                setStSuppliers(formatSuppliers(suppliers))
            })
            .catch(({response}) => {
                if (response.status === 400 && response.data.errorKey && response.data.errorKey.indexOf('invalid.bcItemId') > -1) {
                    if (hasEditMode()) {
                        RouteUtils.redirectTo("/channel/tiki/product/" + itemId);
                    }
                } else {
                    GSToast.commonError();
                }
            })
            .finally(() => setStIsFetching(false))
    }

    const formatCategories = (categories) => {
        return categories.map((category) => ({
            categoryId: category.id,
            categoryName: category.name,
            parentId: category.parent,
            primary: category.primary,
            hasChild: category.hasChild,
        }))
    }

    const formatSuppliers = (suppliers) => {
        return suppliers.map(supplier => ({
            value: supplier.id,
            label: supplier.name,
        }))
    }

    const defaultValue = (key, defaultV) => {
        return Object.keys(stProduct).length === 0 && stProduct.constructor === Object
            ? defaultV
            : stProduct[key]
    }

    const isMainImage = (index) => {
        if (stProdImageMain === -1) {
            if (index === 0) {
                setStProdImageMain(0)

                return true
            }
        } else {
            return stProdImageMain === index
        }
    }

    const onSelectMainImage = (index) => {
        setStProdImageMain(index)
    }

    const onRemoveImage = (index) => {
        let productImages = stProductImages
        let prodImageMain = stProdImageMain

        productImages.splice(index, 1)

        if (productImages.length === 0) {
            prodImageMain = -1
        } else if (prodImageMain === index) {
            prodImageMain = 0
        }

        setStProductImages([...productImages])
        setStProdImageMain(prodImageMain)
    }

    const onImageUploaded = (files) => {
        if (!Array.isArray(files)) {
            files = [...files]
        }

        // filter size
        files = files.filter((file) => (file.size / 1024 / 1024) < IMAGE_MAX_SIZE_BY_MB)

        // filter length
        let productImages = [...stProductImages, ...files].slice(0, IMAGE_MAX_LENGTH)

        if (stProductImages.length === 0) {
            setStProdImageMain(0)
        }

        setStProductImages(productImages)
    }

    const toggleMoreInfo = () => {
        setStIsCollapsed((isCollapsed) => !isCollapsed)
    }

    const toggleAttributes = () => {
        if (stEditModeController.disableAttribute) {
            return
        }

        setStIsShowAllAttributes((isShowAllAttributes) => !isShowAllAttributes)
    }

    const onSelectCategory = (categoryId) => {
        setStIsFetchingAttributes(true)
        setStCategoryId(categoryId)
        setStSubmitCategoryError('')

        tikiService.getAttributes({"categoryId.equals": categoryId})
            .then(attributes => {
                setStAttributesMandatory(attributes.filter(attr => attr.isRequired))
                setStAttributesNonMandatory(attributes.filter(attr => !attr.isRequired))
            })
            .finally(() => setStIsFetchingAttributes(false))
    }

    const uploadImageToServer = () => {
        let promiseArr = []

        for (let image of stProductImages) {
            if (image.id) continue

            const uploadHandle = mediaService.uploadFileWithDomain(
                image, MediaServiceDomain.ITEM
            )

            promiseArr.push(uploadHandle)
        }

        return Promise.all(promiseArr)
    }

    const fireSubmitForm = () => {
        refSubmitFrom.current.click()
    }

    const handleInvalidSubmit = () => {
        setStIsValidForm(false)
    }

    const validationForm = (variations) => {
        // check image
        if (stProductImages.length === 0) {
            return false
        }
        if (stIsDimensionImageError) {
            return false
        }

        // check price
        if (refProdPrice.current && !refProdPrice.current.isValid()) {
            return false;
        }

        // check discount price
        if (refProdDiscount.current && !refProdDiscount.current.isValid()) {
            return false;
        }

        // refProdStock
        if (refProdStock.current && !refProdStock.current.isValid()) {
            return false;
        }

        // validate variation //show message in itself
        if (variations.length > 400) {
            return false
        }

        return true
    }

    const handleValidSubmit = (event, values) => {
        // loading
        setStIsSaving(true)
        setStSubmitCategoryError('')

        //-------------------------------//
        // get attribute first
        //-------------------------------//
        let totalAttrList = [...stAttributesNonMandatory, ...stAttributesMandatory]
        let selectedAttrList = {}

        totalAttrList.forEach(attr => {
            const value = values["attr_" + attr.id]

            if (value) {
                selectedAttrList[attr.code] = value
            }
        })

        //-------------------------------//
        // get variation 
        //-------------------------------//
        let variations = []
        let tierVariations = []

        if (refProdVariation.current) {
            if (refProdVariation.current.isInvalidForm()) {
                refProdVariation.current.refFrom.current.submit()

                setStIsSaving(false)
                setStIsValidForm(false)

                return
            }

            tierVariations = refProdVariation.current.getTiers()

            const prodVariations = refProdVariation.current.getVariations()

            variations = prodVariations.map(variation => {
                // change index string to list
                const tierIndexes = variation.tierIndex.split(',').map((index) => parseInt(index))

                // get name of variation
                let variationOption = {}

                if (tierVariations.length === 1) {
                    variationOption = {
                        option1: tierVariations[0].options[tierIndexes[0]]
                    }
                } else {
                    variationOption = {
                        option1: tierVariations[0].options[tierIndexes[0]],
                        option2: tierVariations[1].options[tierIndexes[1]]
                    }
                }

                return {
                    bcModelId: variation.id,
                    tkVariantId: variation.tkVariantId,
                    image: variation.image,
                    inventory_type: stInventory[INVENTORY_OPTIONS.INVENTORY_TYPE],
                    ...variationOption,
                    price: variation.newPrice,
                    market_price: variation.marketPrice,
                    quantity: variation.totalItem,
                    sku: variation.sku || null,
                    supplier: stInventory[INVENTORY_OPTIONS.INVENTORY_TYPE] === INVENTORY_VALUES.INSTOCK ? null : stInventory[INVENTORY_OPTIONS.SUPPLIER]
                }
            })
        }

        //-------------------------------//
        // validate form
        //-------------------------------//
        if (!validationForm(variations)) {
            setStIsSaving(false)
            setStIsValidForm(false)

            return
        }

        // check category required 
        if (!stCategoryId && !hasEditMode()) {
            setStSubmitCategoryError(i18next.t('common.validation.required'))
            setStIsSaving(false)
            setStIsValidForm(false)

            return
        }

        setStIsValidForm(true)

        //-------------------------------//
        // start to sync
        //-------------------------------//
        uploadImageToServer()
            .then(images => {
                //-------------------------------//
                // get image
                //-------------------------------//
                let productImages = [...stProductImages, ...images]
                let imageObjects = []

                productImages.forEach(img => {
                    img.imageId && imageObjects.push({
                        url: img.urlPrefix + "/" + img.imageId + '.jpg'
                    })
                })

                // swap image
                let mainImage = imageObjects[stProdImageMain]
                imageObjects.splice(stProdImageMain, 1)
                imageObjects.unshift(mainImage)

                //set rank for image inside
                imageObjects = imageObjects.map((imgObj, index) => ({
                    ...imgObj,
                    rank: index
                }))

                //Re-update rank of variation image
                variations = variations.map(variation => {
                    if (variation.image) {
                        const imageObj = imageObjects.find(img => img === variation.image)

                        if (imageObj) {
                            return {
                                ...variation,
                                imageRank: imageObj.rank
                            }
                        } else {
                            //if find nothing variation image, assign main image for variation
                            const mainImage = stProductImages[stProdImageMain]

                            return {
                                ...variation,
                                image: mainImage.urlPrefix + "/" + mainImage.imageId + '.jpg',
                                imageRank: mainImage.rank
                            }
                        }
                    }

                    return {
                        ...variation
                    }
                })

                //-------------------------------//
                // request
                //-------------------------------//
                if (hasEditMode()) {
                    let request = {
                        tkItemId: stProduct.tkItemId,
                        bcItemId: stProduct.id,
                        images: imageObjects,
                        variants: variations,
                        originalSku: values['productSKU'],
                        marketPrice: refProdPrice.current && refProdPrice.current.getValue(),
                        price: refProdDiscount.current && refProdDiscount.current.getValue(),
                        quantity: refProdStock.current && refProdStock.current.getValue(),
                    }

                    return tikiService.syncUpdateProduct(clean(request))
                } else {
                    let request = {
                        attributes: {
                            brand: CredentialUtils.getStoreName(),
                            support_p24h_delivery: 0,
                            require_expiry_date: 0,
                            vat: 0,
                            ...selectedAttrList
                        },
                        tkItemId: stProduct.tkItemId,
                        bcItemId: stProduct.id,
                        categoryId: stCategoryId,
                        description: formatAfterEditByAvField(values.productDescription),
                        imageObjects: imageObjects,
                        labelVariants: tierVariations.map(tier => tier.name),
                        name: values.productName,
                        variants: variations,
                        inventoryType: stInventory[INVENTORY_OPTIONS.INVENTORY_TYPE],
                        supplier: stInventory[INVENTORY_OPTIONS.INVENTORY_TYPE] === INVENTORY_VALUES.INSTOCK ? null : stInventory[INVENTORY_OPTIONS.SUPPLIER]
                    }

                    return tikiService.syncNewProduct(clean(request))
                }
            })
            .then(() => {
                setStRedirectPageConfirm(false)
                RouteUtils.linkTo(props, NAV_PATH.tikiProduct)
            })
            .catch(({response}) => {
                if (response.status === 400) {
                    if (response.data.errorKey) {
                        if (response.data.errorKey.indexOf('duplicateSku') > -1) {
                            GSToast.error('page.tiki.product.edit.sku_duplicate.title', true)
                            return
                        }
                        if (response.data.errorKey.indexOf('item.waiting.approve') > -1) {
                            GSToast.error('page.tiki.product.edit.waitingApprove.title', true)
                            return
                        }
                    }

                    GSToast.error('page.tiki.product.edit.unknow_error.title', true)
                    return
                }
                GSToast.commonError()
            })
            .finally(() => {
                setStIsSaving(false)
            })
    }

    const renderAttributes = (attributes, required) => {
        return attributes.map((attr, index) => {
            switch ('STRING_TYPE') {
                case 'STRING_TYPE':
                    return (
                        <div key={index}>
                            <Label for={'attr-' + attr.code} className="gs-frm-control__title">
                                {attr.code}
                            </Label>

                            <AvField
                                name={'attr_' + attr.id}
                                validate={{
                                    required: {
                                        value: required,
                                        errorMessage: i18next.t('common.validation.required')
                                    },
                                    maxLength: {
                                        value: 40,
                                        errorMessage: i18next.t("common.validation.char.max.length", {x: 40})
                                    }
                                }}
                            />
                        </div>
                    )

                case 'INT_TYPE':
                    return (
                        <div key={index}>
                            <Label for={'attr-' + attr.code} className="gs-frm-control__title">
                                {attr.code}
                            </Label>

                            <AvField
                                type="number"
                                name={'attr_' + attr.id}
                                validate={{
                                    required: {
                                        value: required,
                                        errorMessage: i18next.t('common.validation.required')
                                    },
                                    maxLength: {
                                        value: 40,
                                        errorMessage: i18next.t("common.validation.char.max.length", {x: 40})
                                    }
                                }}
                            />
                        </div>
                    )
                case 'DATE_TYPE':
                    return (
                        <div key={index}>
                            <Label for={'attr-' + attr.code} className="gs-frm-control__title">
                                {attr.code}
                            </Label>

                            <AvField
                                type="date"
                                name={'attr_' + attr.id}
                                validate={{
                                    required: {
                                        value: required,
                                        errorMessage: i18next.t('common.validation.required')
                                    },
                                    maxLength: {
                                        value: 40,
                                        errorMessage: i18next.t("common.validation.char.max.length", {x: 40})
                                    }
                                }}
                            />
                        </div>
                    )
            }
        })
    }

    const formatAfterEditByAvField = (value) => {
        return value ? value.replace(/<p>/g, '').replace(/<\/p>/g, '<br>').replace(/\n/g, '<br>') : ''
    }

    const onChooseFilter = (field, {value}) => {
        setStInventory(inventory => ({
            ...inventory,
            [field]: value
        }))
    }

    const skuValidation = (value, ctx) => {
        if (!/^[a-zA-Z0-9]+$/.test(value)) {
            return i18next.t('page.tiki.product.edit.sku_format.title')
        }

        return true
    }

    const clean = (obj) => {
        let clonedObj = obj

        for (let propName in clonedObj) {
            let propValue = clonedObj[propName]

            if (propValue === null || propValue === undefined) {
                delete clonedObj[propName]
            } else if (propValue instanceof Object || propValue instanceof Array) {
                if (_.isEmpty(propValue)) {
                    delete clonedObj[propName]
                } else {
                    clean(propValue)
                }
            }
        }

        return clonedObj
    }

    const handlePriceChanged = (value) => {
        setStProductPrice(value)
    }

    return (
        <>
            {stIsSaving && <LoadingScreen/>}

            <GSContentContainer className="tiki-product-container" isLoading={stIsFetching}
                                confirmWhenRedirect={true} confirmWhen={stRedirectPageConfirm}>
                <GSContentHeader>
                    <Breadcrumb>
                        <BreadcrumbItem>Tiki</BreadcrumbItem>
                        <BreadcrumbItem>
                            <Trans i18nKey="page.tiki.product.edit.create.list.title">
                                Create listing
                            </Trans>
                        </BreadcrumbItem>
                    </Breadcrumb>
                    <GSButton secondary outline onClick={() => RouteUtils.linkTo(props, NAV_PATH.tikiProduct)}>
                        <Trans i18nKey="common.btn.cancel" className="sr-only">
                            Cancel
                        </Trans>
                    </GSButton>
                    <GSButton success className="btn-save" marginLeft onClick={fireSubmitForm}>
                        <Trans i18nKey="common.btn.create" className="sr-only">
                            Create
                        </Trans>
                    </GSButton>
                </GSContentHeader>
                {!stIsFetching &&
                <GSContentBody size={GSContentBody.size.LARGE}>
                    {!stIsValidForm &&
                    <div className="alert alert-danger product-form__alert product-form__alert--error" role="alert">
                        <Trans i18nKey="component.product.edit.invalidate"/>
                    </div>
                    }
                    <UikWidget className="gs-widget">
                        <UikWidgetHeader>
                            <UikHeadline>
                                <Trans i18nKey="page.tiki.product.edit.listingdetail.title">
                                    Listing Detail
                                </Trans>
                            </UikHeadline>
                            <UikHeadlineDesc>
                                <Trans i18nKey="page.tiki.product.edit.confirm.title">
                                    Verify or edit product detail you want to sync to Tiki
                                </Trans>
                            </UikHeadlineDesc>
                        </UikWidgetHeader>

                        <UikWidgetContent>
                            <AvForm onValidSubmit={handleValidSubmit}
                                    onInvalidSubmit={handleInvalidSubmit}>
                                <UikContentTitle>
                                    <Trans i18nKey="page.tiki.product.edit.selectedproduct.title">
                                        Selected Product
                                    </Trans>
                                </UikContentTitle>
                                <section className="selected-product">
                                    <img src={
                                        stProductImages.length > 0 && stProductImages[stProdImageMain].urlPrefix
                                            ? stProductImages[stProdImageMain].urlPrefix + "/" + stProductImages[stProdImageMain].imageUUID + '.jpg'
                                            : stProductImages.length > 0
                                            ? URL.createObjectURL(stProductImages[stProdImageMain])
                                            : '/assets/images/default_image.png'
                                    }/>
                                    <span>
                                        <label>{stProduct[PRODUCT_KEY.NAME]}</label>
                                        <p>{stProduct[PRODUCT_KEY.ORG_PRICE] > stProduct[PRODUCT_KEY.NEW_PRICE]
                                            ? CurrencyUtils.formatMoneyByCurrency(stProduct[PRODUCT_KEY.NEW_PRICE], defaultValue(PRODUCT_KEY.CURRENCY, 0)) + " ~ " + CurrencyUtils.formatMoneyByCurrency(stProduct[PRODUCT_KEY.ORG_PRICE], defaultValue(PRODUCT_KEY.CURRENCY, 0))
                                            : stProduct[PRODUCT_KEY.ORG_PRICE] < stProduct[PRODUCT_KEY.NEW_PRICE]
                                                ? CurrencyUtils.formatMoneyByCurrency(stProduct[PRODUCT_KEY.ORG_PRICE], defaultValue(PRODUCT_KEY.CURRENCY, 0)) + " ~ " + CurrencyUtils.formatMoneyByCurrency(stProduct[PRODUCT_KEY.NEW_PRICE], defaultValue(PRODUCT_KEY.CURRENCY, 0))
                                                : CurrencyUtils.formatMoneyByCurrency(stProduct[PRODUCT_KEY.ORG_PRICE], defaultValue(PRODUCT_KEY.CURRENCY, 0))
                                        }
                                        </p>
                                    </span>
                                    <span className={"btn-more-info"} onClick={toggleMoreInfo}>
                                        {stIsCollapsed &&
                                        <FontAwesomeIcon className="collapse-expand" icon={"plus-circle"}/>}
                                        {!stIsCollapsed &&
                                        <FontAwesomeIcon className="collapse-expand" icon={"minus-circle"}/>}
                                    </span>
                                </section>
                                <div className="gs-ani__fade-in" hidden={stIsCollapsed}>
                                    <div style={{
                                        marginBottom: '1em'
                                    }}>
                                        <Trans i18nKey="page.tiki.product.edit.overwrite.title">
                                            <span style={{
                                                fontWeight: 'bold',
                                                textDecoration: 'underline'
                                            }}>
                                            </span>
                                            Below information are linked with respective product. You can edit
                                            before syncing to Tiki,
                                            but the link will be broken, further updates to GoSell product might not
                                            update to Tiki.
                                        </Trans>
                                    </div>

                                    <UikContentTitle>
                                        <Trans i18nKey="component.product.addNew.productInformation.name">
                                            Product Name
                                        </Trans>
                                    </UikContentTitle>
                                    <AvFieldCountable
                                        disable={stEditModeController.disableName}
                                        name={'productName'}
                                        type={'input'}
                                        isRequired={true}
                                        minLength={10}
                                        maxLength={120}
                                        rows={12}
                                        value={stProduct[PRODUCT_KEY.NAME]}
                                    />

                                    <UikContentTitle>
                                        <Trans i18nKey="page.tiki.product.edit.description.title">
                                            Description
                                        </Trans>
                                    </UikContentTitle>
                                    {stEditModeController.disableDescription
                                        ? <AvFieldCountable
                                            disable={stEditModeController.disableDescription}
                                            className='product-description'
                                            name={'productDescription'}
                                            type={'input'}
                                            isRequired={true}
                                            minLength={100}
                                            maxLength={100000}
                                            value={stProduct[PRODUCT_KEY.DESCRIPTION]}
                                            rows={12}
                                        />
                                        : <GSEditor
                                            className="product-description"
                                            name={'productDescription'}
                                            isRequired={true}
                                            minLength={100}
                                            maxLength={100000}
                                            value={stProduct[PRODUCT_KEY.DESCRIPTION]}
                                            rows={12}
                                        />}

                                    <UikContentTitle>
                                        <Trans i18nKey="page.tiki.product.edit.image.title">
                                            Images
                                        </Trans>
                                    </UikContentTitle>
                                    <UikWidget className="gs-widget">
                                        <UikWidgetContent className={'widget__content'}
                                                          className={stIsSaving ? 'gs-atm--disable' : ''}>
                                            <div className="image-drop-zone"
                                                 hidden={stProductImages.length > 0}>
                                                <Dropzone onDrop={file => onImageUploaded(file)}>
                                                    {({getRootProps, getInputProps}) => (
                                                        <section>
                                                            <div {...getRootProps()}>
                                                                <input {...getInputProps()}
                                                                       accept={ImageUploadType.JPEG + ',' + ImageUploadType.PNG}/>
                                                                <p><FontAwesomeIcon icon={'upload'}
                                                                                    className="image-drop-zone__icon"/>
                                                                </p>
                                                                <p><GSTrans
                                                                    t="component.product.addNew.images.dragAndDrop"
                                                                    values={{maxSize: IMAGE_MAX_SIZE_BY_MB}}>
                                                                    dragAndDrop
                                                                </GSTrans></p>
                                                            </div>
                                                        </section>
                                                    )}
                                                </Dropzone>
                                            </div>

                                            <div className="image-widget__container"
                                                 hidden={stProductImages.length === 0}>
                                                {stProductImages.map((item, index) => {
                                                    return (<ImageView
                                                        key={(item.id || item.name) + index}
                                                        src={item}
                                                        arrIndex={index}
                                                        isMain={isMainImage(index)}
                                                        onRemoveCallback={onRemoveImage}
                                                        onSelectCallback={onSelectMainImage}/>)
                                                })}
                                                <span
                                                    className="image-widget__image-item image-widget__image-item--no-border">
                                                    <ImageUploader
                                                        hidden={stProductImages.length >= IMAGE_MAX_LENGTH}
                                                        accept={[ImageUploadType.JPEG, ImageUploadType.PNG]}
                                                        multiple={true}
                                                        text={i18next.t('page.tiki.product.edit.addphoto.title')}
                                                        onChangeCallback={onImageUploaded}/>
                                                </span>
                                            </div>
                                            <div className="image-widget__error-wrapper">
                                                <AlertInline
                                                    text={i18next.t("component.product.addNew.images.errAmountMessage_01")}
                                                    type="error"
                                                    nonIcon
                                                    hidden={stProductImages.length >= 1}
                                                />
                                            </div>
                                            <div className="image-widget__error-wrapper">
                                                <AlertInline
                                                    text={i18next.t("component.product.addNew.images.errDimensionMessage")}
                                                    type="error"
                                                    nonIcon
                                                    hidden={!stIsDimensionImageError}
                                                />
                                            </div>
                                        </UikWidgetContent>
                                    </UikWidget>
                                    <UikWidget className="gs-widget">
                                        <div className="row">
                                            {/*Price*/}
                                            {!stEditModeController.hiddenMarketPrice && <div className="col-lg-6 col-md-6 col-sm-12">
                                                <Label for={'productPrice'} className="gs-frm-control__title">
                                                    <Trans i18nKey="component.product.addNew.pricingAndInventory.price">
                                                        Price
                                                    </Trans>
                                                </Label>

                                                <CryStrapInput
                                                    disable={!stEditModeController.hasEditMarketPrice}
                                                    ref={refProdPrice}
                                                    name={'productPrice'}
                                                    thousandSeparator=","
                                                    precision="0"
                                                    unit={stProduct[PRODUCT_KEY.CURRENCY]}
                                                    default_value={defaultValue(PRODUCT_KEY.ORG_PRICE, PRODUCT_KEY.NEW_PRICE)}
                                                    min_value={1000}
                                                    max_value={100000000}
                                                    on_change_callback={handlePriceChanged}
                                                />
                                            </div>}
                                            {/*Discount*/}
                                            {!stEditModeController.hiddenNewPrice && <div className="col-lg-6 col-md-6 col-sm-12">
                                                <Label for={'productDiscountPrice'} className="gs-frm-control__title">
                                                    <Trans
                                                        i18nKey="component.product.addNew.pricingAndInventory.discountPrice">
                                                        Discount Price
                                                    </Trans>
                                                </Label>

                                                <CryStrapInput
                                                    disable={!stEditModeController.hasEditNewPrice}
                                                    ref={refProdDiscount}
                                                    id={'productDiscountPrice'}
                                                    name={'productDiscountPrice'}
                                                    thousandSeparator=","
                                                    precision="0"
                                                    unit={stProduct[PRODUCT_KEY.CURRENCY]}
                                                    default_value={defaultValue(PRODUCT_KEY.NEW_PRICE, PRODUCT_KEY.ORG_PRICE)}
                                                    min_value={stProductPrice / 10 + 1}
                                                    max_value={stProductPrice}
                                                />
                                            </div>}
                                        </div>

                                        <div className="row">
                                            {/*SKU*/}
                                            {!stEditModeController.hiddenSKU &&
                                            <div className="col-lg-6 col-md-6 col-sm-12">
                                                <Label for={'productSKU'} className="gs-frm-control__title">SKU (Stock
                                                    keeping unit)</Label>
                                                <div className={stEditModeController.hasEditSKU ? '' : 'tiki-edit-product--disable'}>
                                                    <AvField
                                                        ref={(ref) => {refProdSKU.current = stEditModeController.hasEditSKU ? ref : null}}
                                                        value={defaultValue('originalSku', '')}
                                                        name={'productSKU'}
                                                        validate={{
                                                            ...FormValidate.required(),
                                                            skuValidation: (value, ctx) => skuValidation(value, ctx),
                                                            maxLength: {
                                                                value: 25,
                                                                errorMessage: i18next.t("common.validation.char.max.length", {x: 25})
                                                            },
                                                        }}
                                                    />
                                                </div>
                                            </div>}

                                            {/*Quantity*/}
                                            {stEditModeController.hiddenQuantity &&
                                            <div className="col-lg-6 col-md-6 col-sm-12">
                                                <Label for={'productQuantity'} className="gs-frm-control__title">
                                                    <Trans i18nKey="component.product.addNew.pricingAndInventory.stock">
                                                        Stock
                                                    </Trans>
                                                </Label>

                                                <CryStrapInput
                                                    ref={refProdStock}
                                                    disable={!stEditModeController.hasEditQuantity}
                                                    name={'productQuantity'}
                                                    thousandSeparator=","
                                                    precision="0"
                                                    unit={CurrencySymbol.NONE}
                                                    default_value={stProduct[PRODUCT_KEY.TOTAL_ITEM] || 0}
                                                    max_value={1000}
                                                    min_value={1}
                                                />
                                            </div>}
                                        </div>
                                    </UikWidget>
                                </div>
                                {!stEditModeController.hiddenCategory && <div>
                                    <UikContentTitle>
                                        <Trans i18nKey="page.tiki.product.edit.category.title">
                                            Categories
                                        </Trans>
                                    </UikContentTitle>
                                    <DropdownTree
                                        disable={stEditModeController.disableCategory}
                                        categories={stCategories}
                                        categoryId={stCategoryId}
                                        channel={Constants.SaleChannels.TIKI}
                                        onSelectCategory={onSelectCategory}
                                    >
                                    </DropdownTree>
                                </div>}
                                {stSubmitCategoryError &&
                                <AlertInline
                                    text={stSubmitCategoryError}
                                    type="error"
                                    nonIcon
                                />}
                                <div className='row'>
                                    <div className='col-xl-6 p-0 mb-3'>
                                        <div className='mb-2'>
                                            <UikContentTitle>
                                                <Trans i18nKey="page.tiki.product.edit.inventory.title">
                                                    Inventory type
                                                </Trans>
                                            </UikContentTitle>
                                        </div>
                                        <DropdownBox
                                            disable={stEditModeController.disableInventoryType}
                                            defaultValue={{
                                                value: stInventory[INVENTORY_OPTIONS.INVENTORY_TYPE],
                                                label: stInventory[INVENTORY_OPTIONS.INVENTORY_TYPE]
                                            }}
                                            items={INVENTORY_TYPES}
                                            field={INVENTORY_OPTIONS.INVENTORY_TYPE}
                                            onSelected={onChooseFilter}
                                        />
                                    </div>
                                    {!!stSuppliers.length && !stIsHiddenSupplierSelector &&
                                    <div className='col-xl-6'>
                                        <div className='mb-2'>
                                            <UikContentTitle>
                                                <Trans i18nKey="page.tiki.product.edit.supplier.title">
                                                    Supplier
                                                </Trans>
                                            </UikContentTitle>
                                        </div>
                                        <DropdownBox
                                            disable={stEditModeController.disableSupplier}
                                            defaultValue={{
                                                value: stInventory[INVENTORY_OPTIONS.SUPPLIER],
                                                label: stInventory[INVENTORY_OPTIONS.SUPPLIER]
                                            }}
                                            items={stSuppliers}
                                            onSelected={onChooseFilter}
                                            field={INVENTORY_OPTIONS.SUPPLIER}
                                        />
                                    </div>}
                                </div>

                                {/*ATTRIBUTES*/}
                                {stIsFetchingAttributes && <Loading style={LoadingStyle.DUAL_RING_GREY}/>}
                                {(stAttributesMandatory.length > 0 || stAttributesNonMandatory.length > 0) && !stIsFetchingAttributes &&
                                <Label className="gsa__uppercase">
                                    <Trans i18nKey="page.tiki.product.detail.attributes.title"/>
                                </Label>}

                                <div hidden={!(stAttributesMandatory.length > 0 && !stIsFetchingAttributes)}>
                                    {renderAttributes(stAttributesMandatory, true)}
                                </div>

                                <div hidden={!(stIsShowAllAttributes && !stIsFetchingAttributes)}>
                                    {renderAttributes(stAttributesNonMandatory, false)}
                                </div>

                                {stAttributesNonMandatory.length > 0 && !stIsFetchingAttributes &&
                                <div
                                    className="collapse-attr-btn gs-atm__flex-col--flex-center gs-atm__flex-align-items--center tiki-edit-product--disable">
                                    {!stIsShowAllAttributes ?
                                        <>
                                            <FontAwesomeIcon icon={"chevron-down"} onClick={toggleAttributes}/>
                                            <Trans i18nKey="page.tiki.product.detail.attributes.subtitle"/>
                                        </>
                                        :
                                        <>
                                            <FontAwesomeIcon icon={"chevron-up"} onClick={toggleAttributes}/>
                                            <Trans i18nKey="page.tiki.product.detail.attributes.collapse"/>
                                        </>
                                    }

                                </div>}

                                <button type="submit" hidden={true} ref={refSubmitFrom}></button>
                            </AvForm>
                        </UikWidgetContent>
                    </UikWidget>
                    {/*VARIANTS*/}
                    {stProduct[PRODUCT_KEY.MODELS] && stProduct[PRODUCT_KEY.MODELS].length > 0 &&
                    <UikWidget>
                        <UikWidgetHeader>
                            <UikHeadline>
                                <Trans i18nKey="page.tiki.product.detail.variants.title"/>
                            </UikHeadline>
                            <UikHeadlineDesc>
                                <Trans i18nKey="page.tiki.product.detail.variants.subTitle"/>
                            </UikHeadlineDesc>
                        </UikWidgetHeader>
                        {stProduct[PRODUCT_KEY.MODELS] && <UikWidgetContent>
                            <TikiEditProductVariantsTable models={stProduct[PRODUCT_KEY.MODELS]}
                                                          ref={refProdVariation}/>
                        </UikWidgetContent>}
                    </UikWidget>}
                </GSContentBody>}
            </GSContentContainer>
        </>
    )
}

const ImageView = (props) => {
    const [stIsSetMainCoverShow, setStIsSetMainCoverShow] = useState(false)
    const [stO9n, setStO9n] = useState(1)
    const [stImageObj, setStImageObj] = useState(null)

    useEffect(() => {
        createImageObject()
    }, [])

    const onMouseEnterImageView = () => {
        if (props.isMain) return

        setStIsSetMainCoverShow(true)
    }

    const onMouseLeaveImageView = () => {
        setStIsSetMainCoverShow(false)
    }

    const createImageObject = () => {
        const {src} = props

        if (src.imageId) {
            setStImageObj(src.urlPrefix + '/' + src.imageId + '.jpg')
        } else {
            ImageUtils.getOrientation(src, (o9n => {
                setStO9n(o9n)
                setStImageObj(URL.createObjectURL(src))
            }))
        }
    }

    return (
        <div
            className={'image-view image-widget__image-item ' + (props.isMain ? 'image-widget__image-item--main' : '')}
            onMouseEnter={onMouseEnterImageView}
            onMouseLeave={onMouseLeaveImageView}
        >
            <a className="image-widget__btn-remove" onClick={() => {
                props.onRemoveCallback(props.arrIndex)
            }}>
                <FontAwesomeIcon icon="times-circle"/>
            </a>
            <img className={"photo " + 'photo--o9n-' + stO9n}
                 width="137px"
                 height="137px"
                 src={stImageObj}/>
            <div hidden={!props.isMain} className="image-widget__main-cover">
                <Trans i18nKey="component.product.addNew.imageView.mainPhoto">
                    Main photo
                </Trans>
            </div>

            <div className="image-widget__set-main-cover" hidden={!stIsSetMainCoverShow}>
                <UikButton transparent
                           className="image-widget__btn-set-main"
                           onClick={() => props.onSelectCallback(props.arrIndex)}>
                    <Trans i18nKey="component.product.addNew.imageView.setMain">
                        Set Main
                    </Trans>
                </UikButton>
            </div>
        </div>
    )
}

export default TikiEditProduct
