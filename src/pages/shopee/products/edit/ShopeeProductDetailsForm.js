import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { AvField, AvForm } from 'availity-reactstrap-validation';
import moment from 'moment';
import React from 'react';
import DateRangePicker from 'react-bootstrap-daterangepicker';
import Dropzone from "react-dropzone";
import { Trans } from "react-i18next";
import { Breadcrumb, BreadcrumbItem } from 'reactstrap';
import Label from "reactstrap/es/Label";
import { UikCheckbox, UikContentTitle } from '../../../../@uik';
import GSContentBody from "../../../../components/layout/contentBody/GSContentBody";
import GSContentContainer from "../../../../components/layout/contentContainer/GSContentContainer";
import GSContentHeader from "../../../../components/layout/contentHeader/GSContentHeader";
import { NAV_PATH } from '../../../../components/layout/navigation/Navigation';
import AlertInline from "../../../../components/shared/AlertInline/AlertInline";
import AvFieldCurrency from "../../../../components/shared/AvFieldCurrency/AvFieldCurrency.js";
import DropdownTree from '../../../../components/shared/DropdownTree/DropdownTree';
import AvFieldCountable from "../../../../components/shared/form/CountableAvField/AvFieldCountable";
import CryStrapInput, { CurrencySymbol } from "../../../../components/shared/form/CryStrapInput/CryStrapInput";
import GSSelect from "../../../../components/shared/form/GSSelect/GSSelect.js";
import GSWidget from "../../../../components/shared/form/GSWidget/GSWidget";
import GSWidgetContent from "../../../../components/shared/form/GSWidget/GSWidgetContent";
import GSWidgetHeader from "../../../../components/shared/form/GSWidget/GSWidgetHeader";
import GSWidgetHeaderSubtitle from "../../../../components/shared/form/GSWidget/GSWidgetHeaderSubtitle";
import ImageUploader, { ImageUploadType } from "../../../../components/shared/form/ImageUploader/ImageUploader";
import GSButton from "../../../../components/shared/GSButton/GSButton";
import GSTooltip from "../../../../components/shared/GSTooltip/GSTooltip";
import GSTrans from "../../../../components/shared/GSTrans/GSTrans";
import Loading, { LoadingStyle } from "../../../../components/shared/Loading/Loading";
import Constants from "../../../../config/Constant";
import { FormValidate } from "../../../../config/form-validate.js";
import i18next from "../../../../config/i18n";
import mediaService, { MediaServiceDomain } from "../../../../services/MediaService";
import shopeeService from '../../../../services/ShopeeService';
import { GSToast } from "../../../../utils/gs-toast";
import { CurrencyUtils } from "../../../../utils/number-format";
import { RouteUtils } from '../../../../utils/route';
import { DATE_RANGE_LOCATE_CONFIG, formatAfterEditByAvField, formatBeforeEditByAvField, ImageView, ProductModelKey } from "./ShopeeSyncEditProduct.js";
import './ShopeeSyncEditProduct.sass';
import ShopeeEditProductVariantsTable from "./VariantsTable/ShopeeEditProductVariantsTable_1";

class ShopeeProductDetailsForm extends React.Component {
  _isMounted = false;

  constructor(props) {
    super(props);

    this.IMAGE_MAX_LENGTH = 9;
    this.IMAGE_MAX_SIZE_BY_MB = 2;

    this.state = {
      itemId: props.match.params.itemId,
      product: {},
      isValidImageAmount: true,
      isSaving: false,
      productImages: [],
      prodImageMain: 0,
      shippingInfo: {},
      categories: [],
      logistics: [],
      logisticsSelected: [],
      isFetching: true,
      isCollapsed: true,
      attributesMandatory: [],
      attributesNonMandatory: [],
      isFetchingAttributes: false,
      isShowAllAttributes: false,
      categoryId: '',
      submitCategoryError: '',
      submitLogisticError: '',
      isValidForm: true,
      redirectPageConfirm: true,
      shopeeShopList: [],
      shopeeSelectedItem: undefined,
      enabledStock: false
    };

    this.lstSpecialAttr = [];
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
    this.handleInvalidSubmit = this.handleInvalidSubmit.bind(this);
    this.selectDate = this.selectDate.bind(this);
    this.fetchItemInfo = this.fetchItemInfo.bind(this);
    this.onChangeDimension = this.onChangeDimension.bind(this);
    this.initShopeeSetting = this.initShopeeSetting.bind(this);
  }

  initShopeeSetting() {
    shopeeService.loadShopeeSetting()
      .then(shopeeShop => {
        const { settingObject } = shopeeShop;
        const enabledStock = !settingObject.autoSynStock; // enabled if autoSynStock is disable
        this.setState({
          enabledStock
        });
      });
  }

  async componentDidMount() {
    this._isMounted = true;

    if (this._isMounted) {
      this.setState({
        isFetching: true
      });
    }

    this.initShopeeSetting();
    this.fetchItemInfo(this.state.itemId);
  }

  componentDidUpdate() {
    if (this.state.gosellProduct && this.state.shopeeShopList.length < 1) {
      shopeeService.findExistedShopeeId(this.state.gosellProduct.shopeeShopId)
        .then(shopeeShop => {
          if (!shopeeShop) {
            throw new Error(`could not found shopee shop with shopId ${this.state.gosellProduct.shopeeShopId}`);
          }
          const { shopName: label, shopId: value } = shopeeShop;
          this.setState({
            shopeeShopList: [{ label, value }]
          });
        });
    }
  }

  /**
   *
   * @param dimensionType "length"|"width"|"height"|"weight"
   * @param value
   */
  onChangeDimension(dimensionType, value) {
    const product = this.state.product;
    product.shippingInfo = {
      ...product.shippingInfo,
      [dimensionType]: value
    };
    this.setState({
      product: product
    });
  }

  fetchItemInfo(itemId) {
    // show loading and remove error
    this.setState({
      isFetching: true,
      submitCategoryError: '',
      submitLogisticError: ''
    });

    Promise.all([
      shopeeService.getItemById(itemId),
      shopeeService.getCategories(),
    ])
      .then(result => {
        const [selectedItem, categories] = result;
        const shippingInfo = {
          length: selectedItem.packageLength,
          width: selectedItem.packageWidth,
          height: selectedItem.packageHeight,
          weight: selectedItem.weight * 1000, // convert kg to g
        };

        this.setState({
          product: selectedItem, // TODO duplicate
          gosellProduct: selectedItem,
          productImages: selectedItem.images,
          shippingInfo,
          logisticsSelected: selectedItem.logistics,
          isFetching: false,
          categoryId: selectedItem.categoryId,
          categories: categories,
          logistics: selectedItem.logistics.map(lgt => ({ ...lgt, self: false })),
        });
      })
      .catch(GSToast.commonError);
  }

  fetchLogistic(shopId) {
    shopeeService.getLogistics(shopId)
      .then(resLgt => {
        this.setState({
          logistics: resLgt.logistics.map(lgt => ({ ...lgt, self: false })),
        });
      });
  }

  defaultValue(key, defaultV) {
    if (Object.keys(this.state.product).length === 0 && this.state.product.constructor === Object)
      return defaultV;
    return this.state.gosellProduct[key];
  }

  isMainImage(index) {
    if (this.state.prodImageMain === -1) {
      if (index === 0) {
        this.setState({
          prodImageMain: 0
        });
        return true;
      }
    } else {
      return this.state.prodImageMain === index;
    }
  }

  onSelectMainImage(index) {
    this.setState({
      prodImageMain: index
    });
  };

  onRemoveImage(index) {
    let lstImgTemp = this.state.productImages;
    lstImgTemp.splice(index, 1);
    const stProdImageMain = this.state.prodImageMain;
    let prodImageMain = index < stProdImageMain ? stProdImageMain - 1 : stProdImageMain;

    if (lstImgTemp.length === 0) {
      prodImageMain = -1;
    }
    else if (prodImageMain === index) {
      prodImageMain = 0;
    }

    this.setState({
      productImages: lstImgTemp,
      prodImageMain: prodImageMain,
      isValidImageAmount: lstImgTemp.length >= 1
    });
  };

  onImageUploaded(files) {
    if (!Array.isArray(files)) {
      files = [...files];
    }
    // filter size
    files = files.filter((file) => file.size / 1024 / 1024 < this.IMAGE_MAX_SIZE_BY_MB);
    // files = files.filter( (file) => file.size / 1024 < 50)


    // filter length
    let tArr = [...this.state.productImages, ...files].slice(0, this.IMAGE_MAX_LENGTH);

    if (this.state.productImages.length === 0) {
      this.setState({ prodImageMain: 0 });
    }

    this.setState({
      productImages: [...tArr],
      isValidImageAmount: tArr.length >= 1
    });
  }

  onImageDrop(files) {
    this.onImageUploaded(files);
  }

  toggleMoreInfo() {
    this.setState(state => {
      return {
        isCollapsed: !state.isCollapsed
      };
    });
  }

  toggleAttributes() {
    this.setState(state => {
      return {
        isShowAllAttributes: !state.isShowAllAttributes
      };
    });
  }

  onSelectCategory(categoryId) {

    this.setState({
      isFetchingAttributes: true,
      categoryId: categoryId,
      submitCategoryError: ''
    });

    shopeeService.getAttributes(categoryId, this.state.gosellProduct.shopeeShopId)
      .then(attributes => {
        this.setState({
          attributesMandatory: attributes.filter(attr => attr.is_mandatory),
          attributesNonMandatory: attributes.filter(attr => !attr.is_mandatory),
        });
      })
      .catch(GSToast.commonError)
      .finally(
        this.setState({ isFetchingAttributes: false })
      );
  }

  uploadImageToServer() {
    let promiseArr = [];
    for (let image of this.state.productImages) {
      if (!image.id) {
        promiseArr.push(mediaService.uploadFileWithDomain(image, MediaServiceDomain.ITEM));
      }
    }
    return Promise.all(promiseArr);
  }

  selectLogistic(logistic) {
    logistic.shopeeLogisticId = logistic.id;

    let lstSelected = this.state.logisticsSelected;
    let existIndex = lstSelected.findIndex(lo => lo.shopeeLogisticId == logistic.id);

    if (existIndex === -1) {
      lstSelected.push(logistic);
    } else {
      lstSelected.splice(existIndex, 1);
    }
    this.setState({ logisticsSelected: lstSelected });

    if (lstSelected && lstSelected.length > 0) {
      this.setState({ submitLogisticError: '' });
    }
  }

  selectDate(picker, inputId) {
    let startTime = picker.startDate;
    const stringTime = moment(startTime).format(DATE_RANGE_LOCATE_CONFIG.UI_DATE_FORMAT);
    $(`#${inputId}`).val(stringTime);
    this.lstSpecialAttr = this.lstSpecialAttr.filter(data => data.id !== inputId);
    this.lstSpecialAttr.push({ id: inputId, value: stringTime });
  }

  fireSubmitForm() {
    this.refSubmitFrom.current.click();
  }

  handleInvalidSubmit() {
    this.setState({ isValidForm: false });
  }

  validationForm(variations) {
    if (this.state.productImages.length < 1) {
      return false;
    }

    return variations.length <= 400;
  }

  handleValidSubmit(_e, values) {

    // loading
    this.setState({
      isSaving: true,
      submitCategoryError: '',
      submitLogisticError: ''
    });

    //-------------------------------//
    // get attribute first
    //-------------------------------//
    let lstTotalAttr = [...this.state.attributesNonMandatory, ...this.state.attributesMandatory];

    let lstAttrSelected = [];
    lstTotalAttr.forEach(attr => {

      let attrT;
      if (attr.input_type === 'TEXT_FILED' && attr.attribute_type === 'TIMESTAMP_TYPE') {
        // in case required
        let data = this.lstSpecialAttr.filter(ele => ele.id === "attr_" + attr.attribute_id);

        if (attr.is_mandatory && (!data || data.length === 0)) {
          // in case empty data
          this.setState({
            isSaving: false
          });
          return false;
        }
        if (data && data.length > 0) {
          const timeString = moment(data[0].value, DATE_RANGE_LOCATE_CONFIG.UI_DATE_FORMAT).format('X');
          attrT = {
            attributes_id: attr.attribute_id,
            value: timeString
          };
        }

      } else {
        if (values["attr_" + attr.attribute_id]) {
          attrT = {
            attributes_id: attr.attribute_id,
            value: values["attr_" + attr.attribute_id]
          };
        }
      }

      if (attrT) {
        lstAttrSelected.push(attrT);
      }
    });

    //-------------------------------//
    // get variation
    //-------------------------------//
    let variations = [];
    let tier_variations = [];

    if (this.refProdVariation.current) {

      if (this.refProdVariation.current.isInvalidForm()) {
        this.refProdVariation.current.refFrom.current.submit();
        this.setState({
          isSaving: false,
          isValidForm: false
        });
        return;
      }

      tier_variations = this.refProdVariation.current.getTiers();
      let isOneOrTwo = tier_variations.length;

      let variationsT = this.refProdVariation.current.getVariations();
      variationsT.forEach(va => {

        // change index string to list
        let tierIndexString = va.tierIndex.split(',');
        let tierIndexInt = [];
        tierIndexString.forEach(index => {
          tierIndexInt.push(parseInt(index));
        });

        // get name of variation
        let va_name = '';

        if (isOneOrTwo === 1) {
          va_name = tier_variations[0].options[tierIndexInt[0]];
        } else {
          va_name = tier_variations[0].options[tierIndexInt[0]] + ',' + tier_variations[1].options[tierIndexInt[1]];
        }

        variations.push({
          variation_id: va.id,
          price: va.newPrice,
          tier_index: tierIndexInt,
          name: va_name,
          variation_sku: va.sku ? va.sku : null,
          stock: va.totalItem
        });
      });
    }

    let hasVariation = variations.length > 0;

    //-------------------------------//
    // get logistic
    //-------------------------------//
    let lstLogisticSelected = [];

    this.state.logistics.forEach(lo => {
      let enable = this.state.logisticsSelected.findIndex(lo2 => lo.id === lo2.shopeeLogisticId) !== -1;
      lstLogisticSelected.push({ logistic_id: lo.id, enabled: enable });
    });

    //-------------------------------//
    // validate form
    //-------------------------------//
    if (!this.validationForm(variations)) {
      this.setState({
        isSaving: false,
        isValidForm: false
      });
      return;
    }

    // check category required
    if (!this.state.categoryId) {
      this.setState({
        submitCategoryError: 'common.validation.required',
        isSaving: false,
        isValidForm: false
      });
      return;
    }

    this.setState({
      isValidForm: true
    });
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
        if (img.urlPrefix) {
          lstImageTotal.push(img.urlPrefix + "/" + img.imageId + '.jpg');
        } else if (img.url) {
          lstImageTotal.push(img.url);
        }
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
        shopee_item_id: this.state.product.shopeeItemId,
        bc_item_id: this.state.product.bcItemId,
        category_id: this.state.categoryId,
        name: values["productName"],
        description: formatAfterEditByAvField(values["productDescription"]),
        item_sku: values["productSKU"] ? values["productSKU"] : null,
        attributes: lstAttrSelected,
        wholesales: [],
        logistics: lstLogisticSelected,
        weight: this.state.shippingInfo.weight,
        package_length: this.state.shippingInfo.length,
        package_width: this.state.shippingInfo.width,
        package_height: this.state.shippingInfo.height,
        condition: 'NEW',
        price: hasVariation ? 10000 : this.refProdPrice.current.getValue(),
        stock: hasVariation ? 1000 : this.refProdStock.current.getValue(),
        images: lstImageTotal,
        is_2_tier_item: tier_variations.length > 0 && hasVariation ? true : false,
        tier_variation: tier_variations,
        variations: hasVariation ? variations : null,
      };

      shopeeService.syncEditProductShopeeOnly(request, this.state.gosellProduct.shopeeShopId)
        .then(() => {
          this.setState({
            isSaving: false,
            redirectPageConfirm: false
          });

          this.fetchItemInfo(this.state.itemId);
          GSToast.commonUpdate();
        }).catch(e => {
          this.setState({ isSaving: false });
          if (e.response.status === 400) {
            if (e.response.data.errorKey && e.response.data.errorKey.indexOf('error_title_character_forbidden') > -1) {
              GSToast.error(i18next.t('page.shopee.product.edit.item_title.title'));

            } else if (e.response.data.errorKey && e.response.data.errorKey.indexOf('error_duplicate') > -1) {
              GSToast.error(i18next.t('page.shopee.product.edit.item_duplicate.title'));

            } else {
              GSToast.error(i18next.t('page.shopee.product.edit.unknow_error.title'));
            }
          } else {
            GSToast.commonError();
          }
        });
    }).catch(_e => {
      this.setState({ isSaving: false });
      GSToast.commonError();
    });
  }

  renderAttributes(attributes, selectedAttrs, required) {

    return attributes.map(attr => {
      let selectedAttr = selectedAttrs.filter(a => attr.attribute_id === a.attribute_id);
      let value = selectedAttr.length > 0 ? selectedAttr[0].value : '';

      if (attr.input_type === 'TEXT_FILED' && attr.attribute_type === 'TIMESTAMP_TYPE') {
        let timeValue;
        let exist = this.lstSpecialAttr.find(data => data.id === 'attr_' + attr.attribute_id);

        // if exist -> get from exit
        if (exist) {
          timeValue = moment(exist.value, DATE_RANGE_LOCATE_CONFIG.UI_DATE_FORMAT);
        } else {
          timeValue = value ? moment(value, 'X') : moment();
          this.lstSpecialAttr.push({ id: 'attr_' + attr.attribute_id, value: timeValue.format(DATE_RANGE_LOCATE_CONFIG.UI_DATE_FORMAT) });
        }

        value = timeValue;
      }

      switch (attr.input_type) {
        case 'TEXT_FILED':
          if (attr.attribute_type === 'STRING_TYPE') {
            return (
              <div>
                <Label for={'attr-' + attr.attribute_name} className="gs-frm-control__title">
                  {attr.attribute_name}
                </Label>

                <AvField
                  name={'attr_' + attr.attribute_id}
                  validate={{
                    required: { value: required, errorMessage: i18next.t('common.validation.required') },
                    maxLength: { value: 40, errorMessage: i18next.t("common.validation.char.max.length", { x: 40 }) }
                  }}
                  value={value}
                />
              </div>
            );
          }
          if (attr.attribute_type === 'INT_TYPE') {
            return (
              <div>
                <Label for={'attr-' + attr.attribute_name} className="gs-frm-control__title">
                  {attr.attribute_name}
                </Label>

                <AvField
                  type="number"
                  name={'attr_' + attr.attribute_id}
                  validate={{
                    required: { value: required, errorMessage: i18next.t('common.validation.required') },
                    maxLength: { value: 40, errorMessage: i18next.t("common.validation.char.max.length", { x: 40 }) }
                  }}
                  value={value}
                />
              </div>
            );
          }
          if (attr.attribute_type === 'DATE_TYPE') {
            return (
              <div>
                <Label for={'attr-' + attr.attribute_name} className="gs-frm-control__title">
                  {attr.attribute_name}
                </Label>

                <AvField
                  type="date"
                  name={'attr_' + attr.attribute_id}
                  validate={{
                    required: { value: required, errorMessage: i18next.t('common.validation.required') },
                    maxLength: { value: 40, errorMessage: i18next.t("common.validation.char.max.length", { x: 40 }) }
                  }}
                  value={value}
                />
              </div>
            );
          }
          if (attr.attribute_type === 'TIMESTAMP_TYPE') {
            return (
              <div>
                <Label for={'attr-' + attr.attribute_name} className="gs-frm-control__title">
                  {attr.attribute_name}
                </Label>
                <div class="form-group">
                  <DateRangePicker
                    style={{ position: "relative" }}
                    minimumNights={0}
                    onApply={(e, pickup) => this.selectDate(pickup, 'attr_' + attr.attribute_id)}
                    locale={DATE_RANGE_LOCATE_CONFIG}
                    singleDatePicker
                    startDate={value}
                  >
                    <input type="text"
                      id={'attr_' + attr.attribute_id}
                      onChange={() => { }}
                      value={value.format(DATE_RANGE_LOCATE_CONFIG.UI_DATE_FORMAT)}
                      className="form-control"
                      onKeyPress={e => e.preventDefault()}
                      name={'attr_' + attr.attribute_id}
                    />
                    <FontAwesomeIcon icon="calendar" color="#939393" size="lg" style={{ position: "absolute", top: "10px", right: "10px" }} />
                  </DateRangePicker>
                </div>
              </div>
            );
          }
          break;
        case 'DROP_DOWN':
        case 'COMBO_BOX':
          return (
            <div>
              <Label for={'attr-' + attr.attribute_name} className="gs-frm-control__title">
                {attr.attribute_name}
              </Label>

              <AvField
                type="select"
                name={'attr_' + attr.attribute_id}
                value={value ? value : attr.options[0]}
                validate={{
                  required: { value: required, errorMessage: i18next.t('common.validation.required') },
                  maxLength: { value: 40, errorMessage: i18next.t("common.validation.char.max.length", { x: 40 }) }
                }}
              >
                {attr.options.map((opt, index) => {
                  return (
                    <option key={opt} value={opt}>
                      {attr.values[index].translate_value ? attr.values[index].translate_value : attr.values[index].original_value}
                    </option>
                  );
                })}
              </AvField>
            </div>
          );
        case 'TIMESTAMP_TYPE':
          return (
            <div>
              <Label for={'attr-' + attr.attribute_name} className="gs-frm-control__title">
                {attr.attribute_name}
              </Label>

              <AvField
                type="date"
                name={'attr_' + attr.attribute_id}
                validate={{
                  required: { value: required, errorMessage: i18next.t('common.validation.required') },
                  maxLength: { value: 10, errorMessage: i18next.t("common.validation.char.max.length", { x: 10 }) }
                }}
              />
            </div>
          );
      }
    });
  }

  render() {

    return (
      <GSContentContainer
        className="shoppe-product-container"
        isLoading={this.state.isFetching}
        confirmWhenRedirect={true}
        confirmWhen={this.state.redirectPageConfirm}
      >
        <GSContentHeader>
          <div className="mr-auto d-flex align-items-center w-25">
            <Breadcrumb>
              <BreadcrumbItem>Shopee</BreadcrumbItem>
              <BreadcrumbItem>
                <Trans i18nKey="page.shopee.product.edit.create.list.title" />
              </BreadcrumbItem>
            </Breadcrumb>
            {this.state.shopeeShopList.length > 0 &&
              <GSSelect
                className="w-50"
                options={this.state.shopeeShopList}
                value={this.state.shopeeShopList[0]}
              />
            }
          </div>

          <GSButton secondary outline onClick={() => RouteUtils.linkTo(this.props, NAV_PATH.shopeeProductList)}>
            <Trans i18nKey="common.btn.cancel" className="sr-only" />
          </GSButton>
          <GSButton success className="btn-save" marginLeft onClick={this.fireSubmitForm} >
            <Trans i18nKey="common.btn.update" className="sr-only" />
          </GSButton>
        </GSContentHeader>
        {!this.state.isFetching &&
          <GSContentBody size={GSContentBody.size.LARGE}>
            {!this.state.isValidForm &&
              <div className="alert alert-danger product-form__alert product-form__alert--error" role="alert">
                <Trans i18nKey="component.product.edit.invalidate" />
              </div>
            }

            <AvForm onValidSubmit={this.handleValidSubmit} onInvalidSubmit={this.handleInvalidSubmit}>

              {/*PRODUCT INFORMATION*/}
              <GSWidget className="gs-widget">
                <GSWidgetHeader>
                  <Trans i18nKey="page.shopee.product.edit.listingdetail.title" />
                  <GSWidgetHeaderSubtitle>
                    <Trans i18nKey="page.shopee.product.edit.confirm.title" />
                  </GSWidgetHeaderSubtitle>
                </GSWidgetHeader>

                <GSWidgetContent>
                  <UikContentTitle>
                    <Trans i18nKey="page.shopee.product.edit.selectedproduct.title" />
                  </UikContentTitle>
                  <section className="selected-product">
                    {this.state.productImages.length > 0
                      ? <img src={this.state.productImages[this.state.prodImageMain].url || URL.createObjectURL(this.state.productImages[this.state.prodImageMain])} />
                      : <img src="/assets/images/default_image.png" />
                    }
                    <span>
                      <label>{this.state.gosellProduct.name}</label>
                      <p>{this.state.gosellProduct.originalPrice > this.state.gosellProduct.price
                        ? CurrencyUtils.formatMoneyByCurrency(this.state.gosellProduct.price, this.defaultValue(ProductModelKey.CURRENCY, 0)) + " ~ " + CurrencyUtils.formatMoneyByCurrency(this.state.gosellProduct.originalPrice, this.defaultValue(ProductModelKey.CURRENCY, 0))
                        : this.state.gosellProduct.originalPrice < this.state.gosellProduct.price
                          ? CurrencyUtils.formatMoneyByCurrency(this.state.gosellProduct.originalPrice, this.defaultValue(ProductModelKey.CURRENCY, 0)) + " ~ " + CurrencyUtils.formatMoneyByCurrency(this.state.gosellProduct.price, this.defaultValue(ProductModelKey.CURRENCY, 0))
                          : CurrencyUtils.formatMoneyByCurrency(this.state.gosellProduct.originalPrice, this.defaultValue(ProductModelKey.CURRENCY, 0))
                      }
                      </p>
                    </span>
                    <span className={"btn-more-info"} onClick={this.toggleMoreInfo}>
                      <FontAwesomeIcon
                        className="collapse-expand"
                        icon={this.state.isCollapsed ? "plus-circle" : "minus-circle"} />
                    </span>
                  </section>
                  <div className="gs-ani__fade-in" hidden={this.state.isCollapsed}>
                    <div className="mb-2">
                      <Trans i18nKey="page.shopee.product.edit.overwrite.title">
                        <span className="font-weight-bold text-decoration-underline" />
                      </Trans>
                    </div>

                    <UikContentTitle>
                      <Trans i18nKey="component.product.addNew.productInformation.name" />
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
                      <Trans i18nKey="page.shopee.product.edit.description.title" />
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
                  <Trans i18nKey="component.product.addNew.images.title" />
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
                              <GSTrans t="component.product.addNew.images.dragAndDrop" values={{ maxSize: this.IMAGE_MAX_SIZE_BY_MB }} />
                            </p>
                          </div>
                        </section>
                      )}
                    </Dropzone>
                  </div>

                  <div className="image-widget__container" hidden={this.state.productImages.length === 0}>
                    {this.state.productImages.map(
                      (item, index) => (
                        <ImageView
                          key={(item.id ? item.id : item.name) + index}
                          src={item.url || item}
                          arrIndex={index}
                          isMain={this.isMainImage(index)}
                          onRemoveCallback={this.onRemoveImage}
                          onSelectCallback={this.onSelectMainImage} />)
                    )}
                    <span className="image-widget__image-item image-widget__image-item--no-border">
                      <ImageUploader
                        hidden={this.state.productImages.length >= this.IMAGE_MAX_LENGTH}
                        accept={[ImageUploadType.JPEG, ImageUploadType.PNG]}
                        multiple={true}
                        text={i18next.t('page.shopee.product.edit.addphoto.title')}
                        onChangeCallback={this.onImageUploaded} />
                    </span>
                  </div>
                  <div className="image-widget__error-wrapper">
                    <AlertInline
                      text={i18next.t("component.product.addNew.images.errAmountMessage_01")}
                      type="error"
                      nonIcon
                      hidden={this.state.isValidImageAmount}
                    />
                  </div>
                </GSWidgetContent>
              </GSWidget>

              {/*PRICE*/}
              {!this.state.gosellProduct.hasVariation &&
                <GSWidget>
                  <GSWidgetHeader>
                    <Trans i18nKey="page.product.create.pricing" />
                  </GSWidgetHeader>
                  <GSWidgetContent>
                    <div className="col-lg-6 col-md-6 col-sm-12">
                      <Label for={'productPrice'} className="gs-frm-control__title">
                        <Trans i18nKey="component.product.addNew.pricingAndInventory.price" />
                      </Label>
                      <CryStrapInput
                        ref={this.refProdPrice}
                        name={'productPrice'}
                        thousandSeparator=","
                        precision="0"
                        // unit={this.state.product.currency}
                        unit={this.state.gosellProduct.currency === "VND" ? CurrencySymbol.VND : this.state.gosellProduct.currency}
                        default_value={
                          this.state.product.newPrice ? this.state.product.newPrice : this.state.product.orgPrice
                        }
                        min_value={1000}
                        max_value={100000000}
                        on_change_callback={this.onChangePrice}
                      />
                    </div>
                  </GSWidgetContent>
                </GSWidget>
              }

              {/*WAREHOUSING*/}
              <GSWidget>
                <GSWidgetHeader>
                  <GSTrans t="page.product.create.warehousing" />
                </GSWidgetHeader>
                <GSWidgetContent className="row">
                  {/*SKU*/}
                  <div className="pl-md-0 col-lg-6 col-md-6 col-sm-12">
                    <Label for={'productSKU'} className="gs-frm-control__title">SKU (Stock keeping unit)</Label>
                    <AvField
                      onChange={(_e, v) => { this.ipSku = v; }}
                      value={this.defaultValue(ProductModelKey.PARENT_SKU, '')}
                      name={'productSKU'}
                      validate={{
                        minLength: { value: 1, errorMessage: i18next.t("common.validation.char.min.length", { x: 1 }) },
                        maxLength: { value: 100, errorMessage: i18next.t("common.validation.char.max.length", { x: 100 }) }
                      }}
                    />
                  </div>

                  {/*Quantity*/}
                  {!this.state.gosellProduct.hasVariation &&
                    <div className="pr-md-0 col-lg-6 col-md-6 col-sm-12">
                      <Label for={'productQuantity'} className="gs-frm-control__title">
                        <Trans i18nKey="component.product.addNew.pricingAndInventory.stock" />
                      </Label>
                      <CryStrapInput
                        ref={this.refProdStock}
                        name={'productQuantity'}
                        thousandSeparator=","
                        precision="0"
                        unit={CurrencySymbol.NONE}
                        default_value={this.state.gosellProduct.stock}
                        max_value={Constants.N999_999}
                        min_value={Constants.N0}
                        className={this.state.enabledStock ? "" : "gs-atm--disable"}
                      />
                    </div>
                  }
                </GSWidgetContent>
              </GSWidget>

              {/*VARIANTS*/}
              {this.state.gosellProduct.hasVariation &&
                <GSWidget>
                  <GSWidgetHeader>
                    <Trans i18nKey="page.shopee.product.detail.variants.title" />
                    <GSWidgetHeaderSubtitle>
                      <Trans i18nKey="page.shopee.product.detail.variants.subTitle" />
                    </GSWidgetHeaderSubtitle>
                  </GSWidgetHeader>
                  <GSWidgetContent >
                    <ShopeeEditProductVariantsTable
                      variations={this.state.product.variations}
                      isGenuineShopeeProduct={true}
                      variations={this.state.gosellProduct.variations}
                      tierVariations={this.state.gosellProduct.tierVariations}
                      ref={this.refProdVariation}
                      enabledStock={true}
                    />
                  </GSWidgetContent>
                </GSWidget>}

              {/*CATEGORY*/}
              <GSWidget>
                <GSWidgetHeader>
                  <GSTrans t={"component.product.addNew.productInformation.category"} />
                </GSWidgetHeader>
                <GSWidgetContent>
                  <UikContentTitle>
                    <Trans i18nKey="page.shopee.product.edit.category.title" />
                  </UikContentTitle>

                  <DropdownTree ref={this.refProdCategory}
                    categories={this.state.categories}
                    categoryId={this.state.categoryId}
                    onSelectCategory={this.onSelectCategory}
                  >
                  </DropdownTree>
                  {this.state.submitCategoryError &&
                    <AlertInline text={i18next.t(this.state.submitCategoryError)} type="error" nonIcon />
                  }

                  {/*ATTRIBUTES*/}
                  {this.state.isFetchingAttributes && <Loading style={LoadingStyle.DUAL_RING_GREY} />}
                  {(this.state.attributesMandatory.length > 0 || this.state.attributesNonMandatory.length > 0) && !this.state.isFetchingAttributes &&
                    <UikContentTitle>
                      <Trans i18nKey="page.shopee.product.detail.attributes.title" />
                    </UikContentTitle>
                  }

                  <div hidden={!(this.state.attributesMandatory.length > 0 && !this.state.isFetchingAttributes)} >
                    {
                      this.renderAttributes(this.state.attributesMandatory, this.state.product.attributes.filter(attr => attr.is_mandatory), true)
                    }
                  </div>

                  <div hidden={!(this.state.isShowAllAttributes && !this.state.isFetchingAttributes)} >
                    {this.renderAttributes(this.state.attributesNonMandatory, this.state.product.attributes.filter(attr => !attr.is_mandatory), false)}
                  </div>

                  {this.state.attributesNonMandatory.length > 0 && !this.state.isFetchingAttributes &&
                    <div className="collapse-attr-btn gs-atm__flex-col--flex-center gs-atm__flex-align-items--center">
                      {!this.state.isShowAllAttributes ?
                        <>
                          <FontAwesomeIcon icon={"chevron-down"} onClick={this.toggleAttributes} />
                          <Trans i18nKey="page.shopee.product.detail.attributes.subtitle" />
                        </>
                        :
                        <>
                          <FontAwesomeIcon icon={"chevron-up"} onClick={this.toggleAttributes} />
                          <Trans i18nKey="page.shopee.product.detail.attributes.collapse" />
                        </>
                      }

                    </div>
                  }
                </GSWidgetContent>

              </GSWidget>

              {/*SHIPPING*/}
              <GSWidget>
                <GSWidgetHeader>
                  <Trans i18nKey="component.product.addNew.shipping.title" />
                  <GSTooltip message={i18next.t('page.product.create.dimensionHint')} />
                </GSWidgetHeader>
                <GSWidgetContent className="row">
                  {/*Weight*/}
                  <div className="pl-md-0 col-lg-3 col-md-3 col-sm-12">
                    <Label for={'productWeight'} className="gs-frm-control__title">
                      <Trans i18nKey="component.product.addNew.shipping.weight" />
                    </Label>

                    <AvFieldCurrency
                      ref={this.refProdWeight}
                      name={'productWeight'}
                      thousandSeparator=","
                      precision="0"
                      unit={CurrencySymbol.G}
                      validate={{
                        ...FormValidate.minValue(0),
                        ...FormValidate.maxValue(1000000),
                      }}
                      onBlur={(value) => this.onChangeDimension("weight", value)}
                      value={this.state.shippingInfo.weight}
                    />
                  </div>

                  {/*Length*/}
                  <div className="col-lg-3 col-md-3 col-sm-12">
                    <Label for={'productLength'} className="gs-frm-control__title">
                      <Trans i18nKey="component.product.addNew.shipping.length" />
                    </Label>
                    <AvFieldCurrency
                      ref={this.refProdWeight}
                      name={'productLength'}
                      thousandSeparator=","
                      precision="0"
                      unit={CurrencySymbol.CM}
                      validate={{
                        ...FormValidate.minValue(1),
                        ...FormValidate.maxValue(1000000),
                      }}
                      onBlur={(value) => this.onChangeDimension("length", value)}
                      value={this.state.shippingInfo.length}
                    />
                  </div>

                  {/*Width*/}
                  <div className="col-lg-3 col-md-3 col-sm-12">
                    <Label for={'productWidth'} className="gs-frm-control__title">
                      <Trans i18nKey="component.product.addNew.shipping.width" />
                    </Label>

                    <AvFieldCurrency
                      ref={this.refProdWidth}
                      name={'productWidth'}
                      thousandSeparator=","
                      precision="0"
                      unit={CurrencySymbol.CM}
                      validate={{
                        ...FormValidate.minValue(1),
                        ...FormValidate.maxValue(1000000),
                      }}
                      onBlur={(value) => this.onChangeDimension("width", value)}
                      value={this.state.shippingInfo.width} />
                  </div>

                  {/*Height*/}
                  <div className="pr-md-0 col-lg-3 col-md-3 col-sm-12">
                    <Label for={'productHeight'} className="gs-frm-control__title">
                      <Trans i18nKey="component.product.addNew.shipping.height" />
                    </Label>

                    <AvFieldCurrency
                      ref={this.refProdHeight}
                      name={'productHeight'}
                      thousandSeparator=","
                      precision="0"
                      unit={CurrencySymbol.CM}
                      validate={{
                        ...FormValidate.minValue(1),
                        ...FormValidate.maxValue(1000000),
                      }}
                      onBlur={(value) => this.onChangeDimension("height", value)}
                      value={this.state.shippingInfo.height} />
                  </div>
                </GSWidgetContent>
              </GSWidget>

              {/*LOGISTICS*/}
              {this.state.logistics.length > 0 &&
                <GSWidget>
                  <GSWidgetHeader>
                    <Trans i18nKey="page.shopee.product.detail.logistics.title" />
                    <GSWidgetHeaderSubtitle>
                      <Trans i18nKey="page.shopee.product.detail.logistics.subTitle" />
                    </GSWidgetHeaderSubtitle>
                  </GSWidgetHeader>
                  <GSWidgetContent >
                    <div className="logistics-container">
                      {this.state.logistics.map(logistic => (
                        <UikCheckbox
                          key={logistic.id}
                          onClick={() => this.selectLogistic(logistic)}
                          label={logistic.name}
                        />
                      ))}
                    </div>
                  </GSWidgetContent>
                  {this.state.submitLogisticError &&
                    <AlertInline text={this.state.submitLogisticError} type="error" nonIcon />
                  }
                </GSWidget>
              }
            </AvForm>
          </GSContentBody>
        }
      </GSContentContainer>
    );
  }
}

export default ShopeeProductDetailsForm;
