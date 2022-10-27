/*******************************************************************************
 * Copyright 2019 (C) Mediastep Software Inc.
 *
 * Created on : 25/06/2019
 * Author: Tien Dao <tien.dao@mediastep.com>
 *******************************************************************************/
import React from 'react';
import {UikButton, UikWidget, UikWidgetContent, UikWidgetHeader} from '../../../@uik';
import {AvField, AvForm, AvRadio, AvRadioGroup} from 'availity-reactstrap-validation';

import '../../../../sass/ui/_gswidget.sass';
import '../../../../sass/ui/_gsfrm.sass';
import './ImageView.sass';
import Label from 'reactstrap/es/Label';
import ImageUploader, {ImageUploadType} from '../../../components/shared/form/ImageUploader/ImageUploader';
import './CollectionFormEditor.sass';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import Dropzone from 'react-dropzone';
import AlertInline, {AlertInlineType} from '../../../components/shared/AlertInline/AlertInline';
import mediaService, {MediaServiceDomain} from '../../../services/MediaService';
import {CollectionService} from '../../../services/CollectionService';
import {Trans} from 'react-i18next';
import i18next from '../../../config/i18n';
import AlertModal, {AlertModalType} from '../../../components/shared/AlertModal/AlertModal';
import {Redirect} from 'react-router-dom';
import ConfirmModal from '../../../components/shared/ConfirmModal/ConfirmModal';
import {ImageUtils} from '../../../utils/image';
import GSContentHeader from '../../../components/layout/contentHeader/GSContentHeader';
import GSContentBody from '../../../components/layout/contentBody/GSContentBody';
import GSContentContainer from '../../../components/layout/contentContainer/GSContentContainer';
import {calculateDiscount} from '../../../utils/pricing';
import LoadingScreen from '../../../components/shared/LoadingScreen/LoadingScreen';
import {RouteUtils} from '../../../utils/route';
import {NAV_PATH} from '../../../components/layout/navigation/Navigation';
import GSButton from '../../../components/shared/GSButton/GSButton';
import CollectionConditionsConfig, {ConditionTypes} from './ConditionsZone/CollectionConditionsConfig';
import PropTypes from 'prop-types';
import GSTrans from '../../../components/shared/GSTrans/GSTrans';
import ServiceModal from '../SelectServiceModal/ServiceModal';
import Constants from '../../../config/Constant';
import SEOEditor from '../../seo/SEOEditor';
import {ValidateUtils} from '../../../utils/validate';
import ProductNoVariationModal from '../CollectionSelectProductModal/ProductNoVariationModal';
import CollectionTranslateModal from '../Service/CollectionModal/CollectionTranslateModal';
import GSTable from '../../../components/shared/GSTable/GSTable';
import AvFieldCurrency from '../../../components/shared/AvFieldCurrency/AvFieldCurrency';
import {FormValidate} from '../../../config/form-validate';
import {ItemService} from '../../../services/ItemService';
import storageService from '../../../services/storage'
import {ItemUtils} from '../../../utils/item-utils'
import HocSEOEditor from '../../seo/hoc/HocSEOEditor'

export const CollectionFormEditorMode = {
    ADD_NEW: "addNew",
    EDIT: "edit",
};

const ProductModelKey = {
    COLLECTION_ID: "collectionId",
    NAME: "name",
};

export const CollectionType = {
    MANUAL: "MANUAL",
    AUTOMATED: "AUTOMATED",
};

export default class CollectionFormEditor extends React.Component {
    SIZE_PER_PAGE = 10;
    PRODUCT_NAME = "PRODUCT_NAME";
    PRODUCT_PRICE = "PRODUCT_PRICE";

    constructor(props) {
        super(props);

        this.IMAGE_MAX_LENGTH = 5;
        this.IMAGE_MIN_LENGTH = 1;
        this.IMAGE_MAX_SIZE_BY_MB = 10;
        this.DEPLAY_TIME = 500;

        this.state = {
            collectionId: null,
            collectionName: "",
            collectionType: "MANUAL",
            itemList: [],
            collectionImageList: [],
            collectionProductList:[],
            currentPage: 1,
            isShowSelectedProduct: false,
            prodImageMain: -1,
            isValidImageAmount: true,
            isValidProductAmount: true,
            isValidAutomatedConfig: true,
            isSaving: false,
            onRedirect: false,
            isValid: true,
            collectionConditionsConfig: {
                conditionType: ConditionTypes.ALL,
                conditions: [],
            },

            isDiabledSaved: true,
        };

        this.tableConfig = {
            headerList: [],
        };

        this.onImageUploaded = this.onImageUploaded.bind(this);
        this.onRemoveImage = this.onRemoveImage.bind(this);
        this.isMainImage = this.isMainImage.bind(this);
        this.onSelectMainImage = this.onSelectMainImage.bind(this);
        this.onImageDrop = this.onImageDrop.bind(this);
        this.handleOnSaveSubmit = this.handleOnSaveSubmit.bind(this);
        this.isAllFieldValid = this.isAllFieldValid.bind(this);
        this.uploadImageToServer = this.uploadImageToServer.bind(this);
        this.formatImageData = this.formatImageData.bind(this);
        this.handleOnCancel = this.handleOnCancel.bind(this);
        this.defaultValue = this.defaultValue.bind(this);
        this.redirectToCollectionList = this.redirectToCollectionList.bind(this);
        this.onClickRemove = this.onClickRemove.bind(this);
        this.onChangeListPage = this.onChangeListPage.bind(this);
        this.onClickCreateProduct = this.onClickCreateProduct.bind(this);
        this.onCloseCreateProduct = this.onCloseCreateProduct.bind(this);
        this.removeProductRow = this.removeProductRow.bind(this);
        this.onFormChange = this.onFormChange.bind(this);
        this.isDisabledSaveButton = this.isDisabledSaveButton.bind(this);
        this.onChangeCondition = this.onChangeCondition.bind(this);
        this.validateAutomatedValue = this.validateAutomatedValue.bind(this);
        this.handleAutomatedConfigChange = this.handleAutomatedConfigChange.bind(this);
        this.switchByItemType = this.switchByItemType.bind(this);
        // flag
        this.isCheckValidOnly = false;

        this.refSEOUrl = React.createRef();
    }

    componentDidMount() {
        // check edit
        if (this.props.mode === CollectionFormEditorMode.EDIT) {
            this.setState({
                collectionImageList: this.props.item.lstImage,
                itemList: this.props.item.lstProduct,
                collectionId: this.props.item.collectionId,
                collectionName: this.props.item.name,
                collectionType: this.props.item.collectionType,
                prodImageMain: 0,
                collectionConditionsConfig: {
                    conditionType:
                        this.props.item.collectionType === CollectionType.AUTOMATED
                            ? this.props.item.conditionType
                            : ConditionTypes.ALL,
                    conditions:
                        this.props.item.collectionType === CollectionType.AUTOMATED
                            ? this.props.item.lstCondition
                            : [],
                },
            });

            ItemService.getCollectionById(this.props.item.collectionId)
                .then(Collections => {
                    let collectionList = [];
                    let foundCollection;
                    this.props.item.lstProduct.forEach(item=>{
                        foundCollection = Collections.find(id=> id.productId === item.id);
                        foundCollection && collectionList.push(foundCollection)
                    })
                    this.setState({
                        collectionProductList:collectionList
                    })
                })
                .catch(() => {})

            if (this.state.collectionType === CollectionType.MANUAL) {
                //accept edit by manual
                this.setState({isDiabledSaved: false});
            }
        }
    }

    handleAutomatedConfigChange(collectionConditionsConfig) {
        this.setState({
            collectionConditionsConfig: collectionConditionsConfig,
        });

        // check validate
        let isValid = true;
        for (const cond of collectionConditionsConfig.conditions) {
            isValid =
                isValid &&
                this.validateAutomatedValue(cond.values[0].value, cond.conditionField);
        }
        this.setState({
            isValidAutomatedConfig: isValid,
        });

        this.setState({isDiabledSaved: !isValid});
    }

    validateAutomatedValue(val, fieldName) {
        const min_price = 0;
        const max_price = 99999999999;
        if (val === undefined) return false;
        if (fieldName === this.PRODUCT_NAME) {
            if (val === "") {
                return false;
            } else {
                if (val.length < 3) {
                    return false;
                } else {
                    return val.length <= 100;
                }
            }
        } else if (fieldName === this.PRODUCT_PRICE) {
            if (!/^[0-9]+(.[0-9]+)?$/.test(val)) {
                return false;
            } else if (parseFloat(val) < parseFloat(min_price)) {
                return false;
            } else if (parseFloat(val) > parseFloat(max_price)) {
                return false;
            }
        }
        return true;
    }

    isDisabledSaveButton(val) {
        let isValid = true;
        const colName = val || this.state.collectionName;
        if (colName.length < 3) {
            isValid = false;
        }
        // check validate
        for (const cond of this.state.collectionConditionsConfig.conditions) {
            isValid =
                isValid &&
                this.validateAutomatedValue(cond.values[0].value, cond.conditionField);
        }
        this.setState({isDiabledSaved: !isValid});
    }

    onCollectionNameChange(e) {
        let val = e.target.value;
        this.setState({
            collectionName: val,
        });
        this.isDisabledSaveButton(val);
    }

    defaultValue(key, defaultV) {
        if (!this.props.item) return defaultV;
        return this.props.item[key];
    }

    onFormChange(event) {
        this.setState({
            [event.target.name]: event.target.value,
        });

        if (event.target.name === "collectionType") {
            if (event.target.value === CollectionType.MANUAL) {
                this.setState({
                    collectionConditionsConfig: {
                        conditionType: ConditionTypes.ALL,
                        conditions: [],
                    },
                });
                this.setState({isDiabledSaved: false});
            }
        }
    }

    // click on page, show data of a page
    onChangeListPage(pageIndex) {
        this.setState({
            currentPage: pageIndex,
        });
    }

    // button add product click
    onClickCreateProduct() {
        this.setState({
            isShowSelectedProduct: true,
        });
        this.setState({isDiabledSaved: false});
    }

    // remove a product from list
    removeProductRow(productId) {
        let lstCollectionProduct = this.state.collectionProductList
        lstCollectionProduct = lstCollectionProduct.filter((product) => product.productId !== productId);

        let lstPro = this.state.itemList;
        lstPro = lstPro.filter((product) => product.id !== productId);
        this.setState({
            itemList: lstPro,
            collectionProductList:lstCollectionProduct
        });
    }

    // when close modal select product
    onCloseCreateProduct(selectedProductFromModal) {


        if (selectedProductFromModal) {
            //let listProds = [...this.state.itemList, ...selectedProductFromModal]

            let listPrioritys = [];
            selectedProductFromModal.forEach((item)=>{
                let isProduct = this.state.collectionProductList.find(isProduct => isProduct.productId === item.id)
                if(isProduct){
                    listPrioritys.push(isProduct)
                    return
                }

                listPrioritys.push({collectionId: null, productId: item.id, orderPriority: null})
            })




            this.setState({
                itemList: selectedProductFromModal,
                isShowSelectedProduct: false,
                collectionProductList:listPrioritys
            });
        } else {
            this.setState({
                isShowSelectedProduct: false,
            });
        }
    }

    // redirect to collection if OK on confirm modal
    renderRedirect() {
        if (this.state.onRedirect) {
            return (
                <Redirect
                    to={
                        this.props.itemType === Constants.COLLECTION_ITEM_TYPE.PRODUCT
                            ? NAV_PATH.collections
                            : NAV_PATH.collectionsService
                    }
                />
            );
        }
    }

    // redirect to collection if remove this collection
    redirectToCollectionList() {
        this.setState({
            onRedirect: true,
        });
    }

    // choose main image
    onSelectMainImage(index) {
        this.setState({
            prodImageMain: index,
        });
    }

    // drad and drop or choose image from folder
    onImageUploaded(files) {
        if (!Array.isArray(files)) {
            files = [...files];
        }
        // filter size
        files = files.filter(
            (file) => file.size / 1024 / 1024 < this.IMAGE_MAX_SIZE_BY_MB
        );
        // files = files.filter( (file) => file.size / 1024 < 50)

        // filter length
        let tArr = [...this.state.collectionImageList, ...files].slice(
            0,
            this.IMAGE_MAX_LENGTH
        );

        this.setState({
            collectionImageList: [...tArr],
            //isValidImageAmount: tArr.length >= this.IMAGE_MIN_LENGTH && tArr.length <= this.IMAGE_MAX_LENGTH
        });
    }

    // remove image from list
    onRemoveImage(index) {
        let lstImgTemp = this.state.collectionImageList;
        lstImgTemp.splice(index, 1);
        let prodImageMain = this.state.prodImageMain;

        if (lstImgTemp.length === 0) {
            prodImageMain = -1;
        } else {
            if (prodImageMain === index || lstImgTemp.length === 1) {
                prodImageMain = 0;
            } else if (index < prodImageMain) {
                prodImageMain = prodImageMain - 1;
            }
        }

        this.setState({
            collectionImageList: lstImgTemp,
            prodImageMain: prodImageMain,
            //isValidImageAmount: this.state.collectionImageList.length >= this.IMAGE_MIN_LENGTH && this.state.collectionImageList.length <= this.IMAGE_MAX_LENGTH
        });
    }

    // check if image is main
    isMainImage(index) {
        if (this.state.prodImageMain === -1) {
            if (index === 0) {
                this.setState({
                    prodImageMain: 0,
                });
                return true;
            }
        } else {
            if (this.state.prodImageMain === index) return true;
            return false;
        }
    }

    // drop event
    onImageDrop(files) {
        this.onImageUploaded(files);
    }

    // upload image to server
    async uploadImageToServer() {
        let promiseArr = [];

        for (let image of this.state.collectionImageList) {
            if (image.url) continue;
            let uploadHandle = await mediaService.uploadFileWithDomain(
                image,
                MediaServiceDomain.ITEM
            );
            promiseArr.push(uploadHandle);
        }
        return promiseArr;
    }

    // support formating image
    formatImageData(rawImageResponse) {
        return {
            imageId: rawImageResponse.imageId,
            height: rawImageResponse.height,
            width: rawImageResponse.width,
            urlPrefix: rawImageResponse.urlPrefix,
        };
    }

    // check if all valid
    isAllFieldValid() {
        //check image --> image not required
        if (
            this.state.collectionImageList.length < this.IMAGE_MIN_LENGTH ||
            this.state.collectionImageList.length > this.IMAGE_MAX_LENGTH
        ) {
            this.setState({
                isValidImageAmount: false,
            });

            return false;
        }

        // check product number
        if (this.state.itemList.length < 1) {
            this.setState({
                isValidProductAmount: false,
            });

            return false;
        }

        // check automated config
        if (this.state.collectionType === CollectionType.AUTOMATED) {
            if (!this.state.isValidAutomatedConfig) {
                return false;
            }
        }

        return true;
    }

    // cancel button
    handleOnCancel(e) {
        e.preventDefault();
        this.refConfirmModal.openModal({
            messages: i18next.t("component.product.addNew.cancelHint"),
            okCallback: () => {
                this.setState({
                    onRedirect: true,
                });
            },
        });
    }

    // delete button
    onClickRemove(e) {
        e.preventDefault();
        this.refConfirmModal.openModal({
            messages: i18next.t("component.collection.edit.remove.hint"),
            okCallback: () => {
                CollectionService.removeCollection(this.state.collectionId).then(
                    (result) => {
                        this.alertModal.openModal({
                            type: AlertInlineType.SUCCESS,
                            messages: i18next.t("component.collection.edit.remove.success"),
                            closeCallback: this.redirectToCollectionList,
                        });
                    },
                    (e) => {
                        this.alertModal.openModal({
                            type: AlertInlineType.ERROR,
                            messages: i18next.t("component.collection.edit.remove.failed"),
                            closeCallback: this.redirectToCollectionList,
                        });
                    }
                );
            },
        });
    }

    // save button
    async handleOnSaveSubmit(event, values) {
        const isSEOUrlValidRes = this.refSEOUrl.current && await this.refSEOUrl.current.isValid()

        if (!isSEOUrlValidRes) {
            return
        }

        const seo = {
            seoTitle: values.seoTitle ? values.seoTitle : undefined,
            seoDescription: values.seoDescription ? values.seoDescription : undefined,
            seoUrl: values.seoUrl ? ItemUtils.changeNameToLink(values.seoUrl) : undefined,
            seoKeywords: values.seoKeywords ? values.seoKeywords : undefined,
        };

        if (
            !this.state.isValidAutomatedConfig &&
            this.state.collectionType === CollectionType.AUTOMATED
        ) {
            return;
        }

        if (this.state.isSaving) return;

        this.setState({
            isValid: true,
            isSaving: true,
        });

        this.uploadImageToServer()
            .then((imageArr) => {
                //----------------------------------------//
                // process image
                //----------------------------------------//

                let lstImageFinal = [];

                if (this.state.collectionImageList.length > 0) {
                    let lstImages = this.state.collectionImageList;
                    let lstImageTotal = [];

                    lstImages.forEach((img) => {
                        let imageType = imageArr.find(item => (item.originFileName + '.' + item.extension) == img.name)
                        lstImageTotal.push({
                            url: img.url ? img.url : imageArr[0].urlPrefix + '/' + imageType.imageUUID + '.' + imageType.extension
                        })
                    });
                    // swap image
                    let mainIndex = this.state.prodImageMain;
                    let mainImage = lstImageTotal[mainIndex];
                    lstImageTotal.splice(mainIndex, 1);
                    lstImageTotal.unshift(mainImage);

                    // rank data

                    let rank = 0;
                    lstImageTotal.forEach((img) => {
                        lstImageFinal.push({
                            url: img.url,
                            rank: rank,
                        });
                        rank++;
                    });
                }

                //----------------------------------------//
                // process product
                //----------------------------------------//
                let lstProduct = [];
                this.state.itemList.forEach((item,index) => {
                  let priority = this.state.collectionProductList.find(id=>id.productId === item.id)
                    lstProduct.push(
                        {
                            id: item.id,
                            priority: priority?.orderPriority
                        }
                    );
                });

                const matchItemType = () => {
                    switch (this.props.itemType) {
                        case Constants.COLLECTION_ITEM_TYPE.PRODUCT:
                            return Constants.ITEM_TYPE.BUSINESS_PRODUCT;
                        case Constants.COLLECTION_ITEM_TYPE.SERVICE:
                            return Constants.ITEM_TYPE.SERVICE;
                    }
                };

                //----------------------------------------//
                // data submit || THIS WILL CHANGE BY COLLECTION_TYPE
                //----------------------------------------//
                let submitdata = {};
                switch (this.state.collectionType) {
                    case CollectionType.MANUAL:
                        submitdata = {
                            name: this.state.collectionName,
                            collectionType: this.state.collectionType,
                            lstProduct: lstProduct,
                            lstImage: lstImageFinal,
                            itemType: matchItemType(),
                            ...seo,
                        };
                        break;
                    case CollectionType.AUTOMATED:
                        submitdata = {
                            name: this.state.collectionName,
                            collectionType: this.state.collectionType,
                            lstImage: lstImageFinal,
                            lstCondition: this.state.collectionConditionsConfig.conditions,
                            conditionType: this.state.collectionConditionsConfig
                                .conditionType,
                            lstProduct: [],
                            itemType: matchItemType(),
                            ...seo,
                        };
                        break;
                }

                if (this.props.mode === CollectionFormEditorMode.ADD_NEW) {
                    CollectionService.createCollection(submitdata)
                        .then((result) => {
                            this.alertModal.openModal({
                                type: AlertModalType.ALERT_TYPE_SUCCESS,
                                messages: i18next.t(
                                    "component.collection.addNew.success.title"
                                ),
                                closeCallback: () => {
                                    this.setState({onRedirect: true}, () => {
                                        RouteUtils.linkTo(
                                            this.props,
                                            this.props.itemType === Constants.COLLECTION_ITEM_TYPE.PRODUCT
                                                ? NAV_PATH.collections
                                                : NAV_PATH.collectionsService
                                        );
                                    });
                                },
                            });
                        })
                        .catch((e) => {
                            // has error when creating data
                            this.alertModal.openModal({
                                type: AlertModalType.ALERT_TYPE_DANGER,
                                messages: i18next.t("component.collection.addNew.failed.title"),
                                closeCallback: () => {
                                    this.setState({
                                        isSaving: false,
                                    });
                                },
                            });
                        });
                } else if (this.props.mode === CollectionFormEditorMode.EDIT) {
                    submitdata.collectionId = this.state.collectionId;
                    CollectionService.updateCollection(submitdata)
                        .then((result) => {
                            this.alertModal.openModal({
                                type: AlertModalType.ALERT_TYPE_SUCCESS,
                                messages: i18next.t("component.collection.edit.success.title"),
                                closeCallback: () => {
                                    this.setState({onRedirect: true}, () => {
                                        RouteUtils.linkTo(
                                            this.props,
                                            this.props.itemType === Constants.COLLECTION_ITEM_TYPE.PRODUCT
                                                ? NAV_PATH.collections
                                                : NAV_PATH.collectionsService
                                        );
                                    });
                                },
                            });
                        })
                        .catch((e) => {
                            // has error when creating data
                            this.alertModal.openModal({
                                type: AlertModalType.ALERT_TYPE_DANGER,
                                messages: i18next.t("component.collection.edit.failed.title"),
                                closeCallback: () => {
                                    this.setState({
                                        isSaving: false,
                                    });
                                },
                            });
                        });
                }
            })
            .catch((e) => {
                // has error when upload image
                let messageCode = "component.collection.addNew.failed.title";
                if (this.props.mode === CollectionFormEditorMode.EDIT) {
                    messageCode = "component.collection.edit.failed.title";
                }

                this.alertModal.openModal({
                    type: AlertModalType.ALERT_TYPE_DANGER,
                    messages: i18next.t(messageCode),
                    closeCallback: () => {
                        this.setState({
                            isSaving: false,
                        });
                    },
                });
            });
    }

    onChangeCondition(e) {
        const condition = e.currentTarget.value;
        this.setState({
            conditionType: condition,
        });
    }

    switchByItemType(product, service) {
        if (this.props.itemType === Constants.COLLECTION_ITEM_TYPE.PRODUCT) {
            return product;
        } else {
            return service;
        }
    }

    onChangePriority(e, itemId) {
        this.setState(state => ({
            collectionProductList: state.collectionProductList.map(p => {
                if (p.productId === itemId) {
                    p.orderPriority = e.currentTarget.value ? +(e.currentTarget.value) : null
                }

                return p
            })
        }))
    }

    renderHeader() {
        return (
            <div className="header-wrapper">
                <GSContentHeader className="page-toolbar">
                    { this.props.mode === CollectionFormEditorMode.ADD_NEW && (
                        <h5 className="gs-page-title">
                            <Trans
                                i18nKey={ this.switchByItemType(
                                    'component.collection.addNew.product.title',
                                    'component.collection.addNew.service.title'
                                ) }
                            >
                                Create Collection
                            </Trans>
                        </h5>
                    ) }

                    { this.props.mode === CollectionFormEditorMode.EDIT && (

                        <h5 className="gs-page-title product-name">
                            { this.defaultValue(ProductModelKey.NAME, '') }
                        </h5>
                    ) }
                </GSContentHeader>
                { this.renderHeaderBtn() }
            </div>
        );
    }

    renderHeaderBtn() {
        return (
            <div className="gss-content-header--action-btn sticky">
                <div className="gss-content-header--action-btn--group">
                    {/*BTN EDIT TRANSLATE*/}
                    {this.props.mode === CollectionFormEditorMode.EDIT &&
                    <CollectionTranslateModal dataLanguage={this.props.item} itemType={this.props.itemType}/>}
                    {/*BTN SAVE*/}
                    <GSButton
                        success
                        disabled={this.state.isDiabledSaved}
                        className={"btn-save"}
                        style={{marginLeft: "auto"}}
                        onClick={() => this.refBtnSubmitForm.click()}
                    >
            <span
                className="spinner-border spinner-border-sm"
                role="status"
                hidden={!this.state.isSaving}
            ></span>
                        <Trans
                            i18nKey={
                                this.state.isSaving ? "common.btn.saving" : "common.btn.save"
                            }
                            className="sr-only"
                        >
                            Save
                        </Trans>
                    </GSButton>
                    {/*BTN CANCEL*/}
                    <GSButton
                        secondary
                        outline
                        marginLeft
                        hidden={this.state.isSaving}
                        onClick={this.handleOnCancel}
                    >
                        <Trans i18nKey="common.btn.cancel">Cancel</Trans>
                    </GSButton>
                    {/*BTN DELETE*/}
                    {this.props.mode === CollectionFormEditorMode.EDIT && (
                        <GSButton
                            danger
                            outline
                            marginLeft
                            hidden={this.state.isSaving}
                            onClick={this.onClickRemove}
                        >
                            <i className="icon-delete"></i>
                        </GSButton>
                    )}
                </div>
            </div>
        );
    }

    renderCollectionTypeRadioBox() {
        return (
            <AvRadioGroup
                value={this.state.collectionType}
                required
                errorMessage={i18next.t("common.validation.required")}
                className="collection-type"
                onChange={this.onFormChange}
                name="collectionType"
            >
                {((this.props.mode === CollectionFormEditorMode.EDIT &&
                    this.props.item.collectionType === CollectionType.MANUAL) ||
                    this.props.mode === CollectionFormEditorMode.ADD_NEW) && (
                    <>
                        <AvRadio
                            customInput
                            label={i18next.t("component.collection.form.type_manual")}
                            value="MANUAL"
                        />
                        <div className="collection-description">
                            <Trans
                                i18nKey={this.switchByItemType(
                                    "component.collection.form.type_manual.description.product",
                                    "component.collection.form.type_manual.description.service"
                                )}
                            >
                                Add products to this collection one by one.
                            </Trans>
                        </div>
                    </>
                )}
                {((this.props.mode === CollectionFormEditorMode.EDIT &&
                    this.props.item.collectionType === CollectionType.AUTOMATED) ||
                    this.props.mode === CollectionFormEditorMode.ADD_NEW) && (
                    <>
                        <AvRadio
                            customInput
                            label={i18next.t("component.collection.form.type_automated")}
                            value="AUTOMATED"
                            className="collection-radio"
                        />
                        <div className="collection-description">
                            <Trans
                                i18nKey={this.switchByItemType(
                                    "component.collection.form.type_automated.description.product",
                                    "component.collection.form.type_automated.description.service"
                                )}
                            >
                                Existing and future products that match the conditions you set
                                will automatically be added to this collection.
                            </Trans>
                        </div>
                    </>
                )}
            </AvRadioGroup>
        );
    }

    render() {
        return (
            <GSContentContainer
                confirmWhenRedirect
                confirmWhen={!this.state.onRedirect}
                className="collection-form__container"
            >
                {this.state.isSaving && <LoadingScreen/>}
                {this.renderRedirect()}
                {this.renderHeader()}
                <GSContentBody size={GSContentBody.size.LARGE}>
                    <AvForm onValidSubmit={this.handleOnSaveSubmit} autoComplete="off">
                        <button
                            type="submit"
                            ref={(el) => (this.refBtnSubmitForm = el)}
                            hidden
                        />

                        {!this.state.isValid && (
                            <div
                                className="alert alert-danger product-form__alert product-form__alert--error"
                                role="alert"
                            >
                                <Trans i18nKey="component.product.edit.invalidate"/>
                            </div>
                        )}

                        {/*PRODUCT INFO*/}
                        <UikWidget className={"gs-widget "}>
                            <UikWidgetHeader
                                className={"widget__header widget__header--text-align-right"}
                            >
                                <Trans i18nKey="component.collection.form.group.general">
                                    General Information
                                </Trans>
                            </UikWidgetHeader>
                            <UikWidgetContent
                                className={"widget__content "}
                                className={this.state.isSaving ? "gs-atm--disable" : ""}
                            >
                                <Label for={"collectionName"} className="gs-frm-control__title">
                                    <Trans i18nKey="component.collection.form.name">
                                        Collection Name
                                    </Trans>
                                </Label>
                                <AvField
                                    name={"collectionName"}
                                    value={this.defaultValue(ProductModelKey.NAME, "")}
                                    validate={{
                                        required: {
                                            value: true,
                                            errorMessage: i18next.t("common.validation.required"),
                                        },
                                        maxLength: {
                                            value: 50,
                                            errorMessage: i18next.t(
                                                "common.validation.char.max.length",
                                                {x: 50}
                                            ),
                                        },
                                        minLength: {
                                            value: 3,
                                            errorMessage: i18next.t(
                                                "common.validation.char.min.length",
                                                {x: 3}
                                            ),
                                        },
                                    }}
                                    onChange={(e) => {
                                        this.onCollectionNameChange(e);
                                    }}
                                    onPaste={this.onCollectionNameChange}
                                />
                                <Label className="gs-frm-control__title">
                                    <Trans i18nKey="component.collection.form.images">
                                        Images
                                    </Trans>
                                </Label>
                                <div
                                    className="image-drop-zone"
                                    hidden={this.state.collectionImageList.length > 0}
                                >
                                    <Dropzone onDrop={this.onImageUploaded}>
                                        {({getRootProps, getInputProps}) => (
                                            <section>
                                                <div {...getRootProps()}>
                                                    <input
                                                        {...getInputProps()}
                                                        accept={
                                                            ImageUploadType.JPEG + "," + ImageUploadType.PNG + "," + ImageUploadType.GIF
                                                        }
                                                    />
                                                    <p>
                                                        <FontAwesomeIcon
                                                            icon={"upload"}
                                                            className="image-drop-zone__icon"
                                                        />
                                                    </p>
                                                    <p>
                                                        <GSTrans
                                                            t="component.product.addNew.images.dragAndDrop"
                                                            values={{maxSize: this.IMAGE_MAX_SIZE_BY_MB}}
                                                        >
                                                            dragAndDrop
                                                        </GSTrans>
                                                    </p>
                                                </div>
                                            </section>
                                        )}
                                    </Dropzone>
                                </div>

                                <div
                                    className="image-widget__container"
                                    hidden={this.state.collectionImageList.length === 0}
                                >
                                    {this.state.collectionImageList.map((item, index) => {
                                        return (
                                            <ImageView
                                                key={
                                                    (item.id
                                                        ? item.id
                                                        : item.name
                                                            ? item.name
                                                            : item.url
                                                                ? item.url
                                                                : "") +
                                                    "_" +
                                                    index
                                                }
                                                src={item}
                                                arrIndex={index}
                                                isMain={this.isMainImage(index)}
                                                onRemoveCallback={this.onRemoveImage}
                                                onSelectCallback={this.onSelectMainImage}
                                            />
                                        );
                                    })}
                                    <span className="image-widget__image-item image-widget__image-item--no-border">
                    <ImageUploader
                        hidden={
                            this.state.collectionImageList.length >=
                            this.IMAGE_MAX_LENGTH
                        }
                        accept={[ImageUploadType.JPEG, ImageUploadType.PNG, ImageUploadType.GIF]}
                        multiple={true}
                        text="Add more photo"
                        onChangeCallback={this.onImageUploaded}
                    />
                  </span>
                                </div>
                                <div className="image-widget__error-wrapper">
                                    <AlertInline
                                        text={i18next.t(
                                            "component.product.addNew.images.errAmountMessage"
                                        )}
                                        type="error"
                                        nonIcon
                                        hidden={this.state.isValidImageAmount}
                                    />
                                </div>
                            </UikWidgetContent>
                        </UikWidget>

                        {/*COLLECTION TYPE*/}
                        <UikWidget className={"gs-widget "}>
                            <UikWidgetHeader
                                className={"widget__header widget__header--text-align-right"}
                            >
                                <Trans i18nKey="component.collection.form.group.collection_type">
                                    Collection Type
                                </Trans>
                            </UikWidgetHeader>
                            <UikWidgetContent
                                className={"widget__content "}
                                className={this.state.isSaving ? "gs-atm--disable" : ""}
                            >
                                {this.renderCollectionTypeRadioBox()}
                                {/*AUTOMATED CONFIG*/}
                                {this.state.collectionType === CollectionType.AUTOMATED && (
                                    <CollectionConditionsConfig
                                        value={this.state.collectionConditionsConfig}
                                        onChange={this.handleAutomatedConfigChange}
                                        itemType={this.props.itemType}
                                    />
                                )}
                            </UikWidgetContent>
                        </UikWidget>

                        {/*PRODUCT LIST*/}
                        {(this.state.collectionType === CollectionType.MANUAL ||
                            (this.state.collectionType === CollectionType.AUTOMATED &&
                                this.props.mode === CollectionFormEditorMode.EDIT &&
                                this.state.collectionType ===
                                this.props.item.collectionType)) && (
                            <UikWidget className={"gs-widget "}>
                                <UikWidgetHeader
                                    className={"widget__header widget__header--text-align-right"}
                                    rightEl={
                                        // !this.state.isFetching &&
                                        // <UikTag className="collection-list__counter">
                                        //     <GSTrans t="productList.countProduct" values={{
                                        //         total: CurrencyUtils.formatThousand(this.state.itemList.length)
                                        //     }}/>
                                        // </UikTag>
                                        this.state.collectionType === CollectionType.MANUAL && (
                                            <div className="bnt-group_add_product">
                                                <UikButton
                                                    className="btn btn-addproduct"
                                                    transparent="true"
                                                    icon={<i className="btn-addproduct__icon"/>}
                                                    onClick={this.onClickCreateProduct}
                                                >
                                                    <Trans
                                                        i18nKey={this.switchByItemType(
                                                            "component.collection.form.button.add_product.product",
                                                            "component.collection.form.button.add_product.service"
                                                        )}
                                                    >
                                                        Add Product
                                                    </Trans>
                                                </UikButton>
                                            </div>
                                        )
                                    }
                                >
                                    <Trans
                                        i18nKey={this.switchByItemType(
                                            "component.collection.form.group.product_list.product",
                                            "component.collection.form.group.product_list.service"
                                        )}
                                    >
                                        Product List
                                    </Trans>
                                </UikWidgetHeader>
                                <UikWidgetContent
                                    className={"widget__content "}
                                    className={this.state.isSaving ? "gs-atm--disable" : ""}
                                >
                                    {this.state.itemList.length == 0 && (
                                        <div className="product-list__group">
                                            <div
                                                className="gsa-flex-grow--1 gs-atm__flex-col--flex-center gs-atm__flex-align-items--center">
                                                <div>
                                                    <img src="/assets/images/icon-Empty.svg"/>{" "}
                                                    <span>
                            <Trans
                                i18nKey={this.switchByItemType(
                                    "component.collection.form.no_product.product",
                                    "component.collection.form.no_product.service"
                                )}
                            />
                          </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    {this.state.itemList.length > 0 && (
                                        <div>


                                            <GSTable className='table d-mobile-none d-desktop-block'>
                                                <colgroup>
                                                    <col style={{width: '15%'}}/>
                                                    <col style={{width: '40%'}}/>
                                                    <col style={{width: '45%'}}/>
                                                    <col style={{width: '0%'}}/>

                                                </colgroup>
                                                <thead>
                                                {this.state.collectionType ===
                                                CollectionType.MANUAL &&
                                                <tr>
                                                    <th>{i18next.t("component.collection.list.table.thumbnail")}</th>
                                                    <th>{i18next.t("productList.tbheader.productName")}</th>
                                                    <th>{i18next.t("productList.tbheader.priority")}</th>
                                                    <th></th>
                                                </tr>
                                                }
                                                </thead>
                                                <tbody>
                                                {this.state.itemList
                                                    // .slice(
                                                    //     (this.state.currentPage - 1) * this.SIZE_PER_PAGE,
                                                    //     (this.state.currentPage - 1) * this.SIZE_PER_PAGE +
                                                    //     this.SIZE_PER_PAGE
                                                    // )
                                                    .map((dataRow, index) => {

                                                        let orderPriority = this.state.collectionProductList.find(item=> item.productId === dataRow.id)
                                                        console.log(dataRow)


                                                        return (
                                                            <tr
                                                                key={index + "_" + dataRow.id}
                                                                className="gs-table-body-items"
                                                            >
                                                                <td className="gs-table-body-item align-middle">
                                                                    <img
                                                                        alt="product-image"
                                                                        className="product-image__row"
                                                                        src={
                                                                            dataRow.imageId ?
                                                                                ImageUtils.getImageFromImageModel(dataRow, 50) :
                                                                                dataRow.images && dataRow.images.length
                                                                                    ? ImageUtils.getImageFromImageModel(dataRow.images[0], 50)
                                                                                    : (dataRow.image
                                                                                    ? ImageUtils.getImageFromImageModel(dataRow.image, 50)
                                                                                    : '/assets/images/default_image.png')
                                                                        }
                                                                    />
                                                                </td>
                                                                <td className="gs-table-body-item align-middle">
                                                                  <span>
                                                                    <b>{dataRow.name}</b>
                                                                  </span>
                                                                </td>
                                                                <td className="gs-table-body-item align-middle">
                                                                    {this.state.collectionType ===
                                                                    CollectionType.MANUAL &&
                                                                    <AvFieldCurrency className="input-min-width m-0"
                                                                                     name={index + '-priority'}
                                                                                     validate={{
                                                                                         ...FormValidate.maxValue(100000000),
                                                                                         ...FormValidate.minValue(1)
                                                                                     }}
                                                                        value={orderPriority?.orderPriority}
                                                                        onBlur={(e) => this.onChangePriority(e, dataRow.id)}
                                                                    />
                                                                    }


                                                                </td>
                                                                <td className="gs-table-body-item align-middle">
                                                                    {this.state.collectionType ===
                                                                    CollectionType.MANUAL && (
                                                                        <i
                                                                            className="btn-remove__row"
                                                                            onClick={() =>
                                                                                this.removeProductRow(dataRow.id)
                                                                            }
                                                                        />
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}


                                                </tbody>
                                            </GSTable>

                                        </div>
                                    )}
                                    <div className="image-widget__error-wrapper">
                                        <AlertInline
                                            text={i18next.t("component.collection.form.no_product")}
                                            type="error"
                                            nonIcon
                                            hidden={this.state.isValidProductAmount}
                                        />
                                    </div>
                                </UikWidgetContent>
                            </UikWidget>
                        )}
                        {/*SEO*/}
                        <HocSEOEditor ref={ this.refSEOUrl }
                                      langKey={ storageService.getFromLocalStorage(Constants.STORAGE_KEY_INITIAL_LANGUAGE) }
                                      type={ this.props.itemType === Constants.COLLECTION_ITEM_TYPE.PRODUCT
                                          ? Constants.SEO_DATA_TYPE.COLLECTION_PRODUCT
                                          : Constants.SEO_DATA_TYPE.COLLECTION_SERVICE }
                                      data={ this.defaultValue(ProductModelKey.COLLECTION_ID, '') }>
                            <SEOEditor
                                defaultValue={ {
                                    seoUrl: ValidateUtils.defaultValue('seoUrl', '', this.props),
                                    seoKeywords: ValidateUtils.defaultValue(
                                        'seoKeywords',
                                        '',
                                        this.props
                                    ),
                                    seoDescription: ValidateUtils.defaultValue(
                                        'seoDescription',
                                        '',
                                        this.props
                                    ),
                                    seoTitle: ValidateUtils.defaultValue(
                                        'seoTitle',
                                        '',
                                        this.props
                                    )
                                } }
                                prefix={ 'collection/' + this.props.itemType.toLowerCase() + '/' }
                                middleSlug={ ItemUtils.changeNameToLink(this.defaultValue(ProductModelKey.NAME, '')) }
                                postfix={ this.props.item ? `-c${ this.props.item.collectionId }` : '' }
                                assignDefaultValue={ false }
                                enableLetterOrNumberOrHyphen={ false }
                            />
                        </HocSEOEditor>
                    </AvForm>
                </GSContentBody>
                <AlertModal
                    ref={(el) => {
                        this.alertModal = el;
                    }}
                />
                <ConfirmModal
                    ref={(el) => {
                        this.refConfirmModal = el;
                    }}
                />

                {this.state.isShowSelectedProduct && (
                    <>
                        {this.props.itemType === Constants.COLLECTION_ITEM_TYPE.PRODUCT && (
                            <ProductNoVariationModal
                                onClose={this.onCloseCreateProduct}
                                productSelectedList={this.state.itemList}
                            />
                        )}
                        {this.props.itemType === Constants.COLLECTION_ITEM_TYPE.SERVICE && (
                            <ServiceModal
                                onClose={this.onCloseCreateProduct}
                                productSelectedList={this.state.itemList}
                            />
                        )}
                    </>
                )}
            </GSContentContainer>
        );
    }
}

class ImageView extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isSetMainCoverShow: false,
            o9n: 1,
            imageObj: null,
        };

        this.onRemoveCallback = this.props.onRemoveCallback;
        this.onSelectCallback = this.props.onSelectCallback;
        this.onMouseEnterImageView = this.onMouseEnterImageView.bind(this);
        this.onMouseLeaveImageView = this.onMouseLeaveImageView.bind(this);
        this.onClickSetMain = this.onClickSetMain.bind(this);
        this.createImageObject = this.createImageObject.bind(this);
    }

    componentDidMount() {
        this.createImageObject();
    }

    onMouseEnterImageView() {
        if (this.props.isMain) return;
        this.setState({
            isSetMainCoverShow: true,
        });
    }

    onMouseLeaveImageView() {
        // if (this.props.isMain) return
        this.setState({
            isSetMainCoverShow: false,
        });
    }

    onClickSetMain() {
    }

    createImageObject() {
        let src = this.props.src;
        if (src.rank != undefined) {
            this.setState({
                imageObj: src.url,
            });
        } else if (src.imageId) {
            this.setState({
                imageObj: src.urlPrefix + "/" + src.imageId + ".jpg",
            });
        } else {
            ImageUtils.getOrientation(this.props.src, (o9n) => {
                this.setState({
                    o9n: o9n,
                    imageObj: URL.createObjectURL(this.props.src),
                });
            });
        }
    }

    render() {
        return (
            <div
                className={
                    "image-view image-widget__image-item " +
                    (this.props.isMain ? "image-widget__image-item--main" : "")
                }
                onMouseEnter={this.onMouseEnterImageView}
                onMouseLeave={this.onMouseLeaveImageView}
            >
                <a
                    className="image-widget__btn-remove"
                    onClick={() => {
                        this.onRemoveCallback(this.props.arrIndex);
                    }}
                >
                    <FontAwesomeIcon icon="times-circle"></FontAwesomeIcon>
                </a>
                <img
                    className={"photo " + "photo--o9n-" + this.state.o9n}
                    width="137px"
                    height="137px"
                    src={this.state.imageObj}
                />
                <div hidden={!this.props.isMain} className="image-widget__main-cover">
                    <Trans i18nKey="component.product.addNew.imageView.mainPhoto">
                        Main photo
                    </Trans>
                </div>

                <div
                    className="image-widget__set-main-cover"
                    hidden={!this.state.isSetMainCoverShow}
                >
                    <UikButton
                        transparent
                        className="image-widget__btn-set-main"
                        onClick={() => this.onSelectCallback(this.props.arrIndex)}
                    >
                        <Trans i18nKey="component.product.addNew.imageView.setMain">
                            Set Main
                        </Trans>
                    </UikButton>
                </div>
            </div>
        );
    }
}

CollectionFormEditor.propTypes = {
    item: PropTypes.shape({
        collectionId: PropTypes.number,
        name: PropTypes.string,
        collectionType: PropTypes.oneOf(Object.values(CollectionType)),
        conditionType: PropTypes.oneOf(Object.values(ConditionTypes)),
        lstImage: PropTypes.arrayOf(
            PropTypes.shape({
                url: PropTypes.string,
                rank: PropTypes.number,
            })
        ),
        lstProduct: PropTypes.arrayOf(
            PropTypes.shape({
                id: PropTypes.number,
                imageId: PropTypes.number,
                name: PropTypes.string,
                urlPrefix: PropTypes.string,
            })
        ),
        lstCondition: PropTypes.arrayOf(
            PropTypes.shape({
                id: PropTypes.number,
                conditionField: PropTypes.string,
                operand: PropTypes.string,
                values: PropTypes.arrayOf(
                    PropTypes.shape({
                        id: PropTypes.number,
                        value: PropTypes.string,
                    })
                ),
            })
        ),
        seoUrl: PropTypes.string,
        seoTitle: PropTypes.string,
        seoDescription: PropTypes.string,
        seoKeywords: PropTypes.string,
    }),
    mode: PropTypes.any.isRequired,
    itemType: PropTypes.oneOf(Object.values(Constants.COLLECTION_ITEM_TYPE)).isRequired,
};
