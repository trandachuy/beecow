import React, {Component} from 'react';
import {Modal, ModalBody, ModalFooter, ModalHeader} from 'reactstrap';
import ImageUploader, {ImageUploadType} from "../form/ImageUploader/ImageUploader";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {UikWidget, UikWidgetContent} from "../../../@uik";
import i18next from "../../../config/i18n";
import _ from 'lodash';
import './LazadaImageModal.sass';
import Dropzone from "react-dropzone";
import {Trans} from "react-i18next";
import LazadaImageView from "../LazadaImageView";
import {ImageUtils} from "../../../utils/image";
import GSButton from "../GSButton/GSButton";
import GSTrans from "../GSTrans/GSTrans";

class LazadaImageModal extends Component {
    constructor(props) {
        super(props);
        this.IMAGE_MAX_LENGTH = 9
        this.IMAGE_MAX_SIZE_BY_MB = 2
        this.state = {
            modal: false,
            modalBtnOk: i18next.t('common.btn.ok'),
            modalBtnCancel: i18next.t('common.btn.cancel'),
            classNameBtnOk: 'btn-success',
            classNameBtnCancel: 'btn btn-outline-secondary',
            prodImageList: [],
            prodToChild: [],
            isValidImageAmount: true,
            productImages:[],
            uploadImage: props.uploadImage
        };

        this.cancelModal = this.cancelModal.bind(this);
        this.okModal = this.okModal.bind(this);
        this.onImageUploaded = this.onImageUploaded.bind(this);
        this.onRemoveCallback = this.onRemoveCallback.bind(this);
    }

    openModal(options) {
        this.setState(_.extend({
            modal: true
        },options));
       this.setState({prodImageList: options.prodImageList});
    }

    cancelModal() {
        this.setState({
            modal: false
        },
            () => {
                if (this.state.cancelCallback) {
                    this.state.cancelCallback()
                }
            });
    }

    okModal() {
        this.setState({
            modal: false
        },
        () => {
            if (this.state.okCallback) {
                this.state.okCallback(this.state.prodImageList);
            }
        });
    }

    getOrientation = results => {
        return Promise.all(results.map(img =>{
            return new Promise((resolve, reject) =>{
                ImageUtils.getOrientation(img, ( o9n =>{
                    resolve({o9n: o9n, image: URL.createObjectURL(img), rawFile: img});
                }));
            } )
        })) 
    };
    onImageUploaded(files) {
        if (!Array.isArray(files)) {
            files = [...files]
        }
        // filter size
        files = files.filter((file) => file.size / 1024 / 1024 < this.IMAGE_MAX_SIZE_BY_MB);
        this.getOrientation(files).then(res =>{
            this.setState({
                prodImageList: [...this.state.prodImageList, ...res]
            })
        });
    }

    onImageDrop(files) {
        this.onImageUploaded(files)
    }
    isDelete() {
        this.state.checked = !this.state.checked;
    }
    onRemoveCallback(prodImageList){
        this.setState({prodImageList: prodImageList});
    }
    render() {
        let self = this;
        return (
            <Modal isOpen={this.state.modal} className={'image-modal'}>
                <ModalHeader>{this.state.modalTitle}
                <Trans i18nKey="common.txt.modal.image.title">dragAndDrop</Trans>
                <Trans i18nKey="common.txt.modal.image.title.description">description</Trans>
                </ModalHeader>
                <ModalBody>
                    <UikWidget>
                        <UikWidgetContent className={'widget__content'}
                            className={this.state.isSaving ? 'gs-atm--disable' : ''}>
                            <div className="image-drop-zone" hidden={this.state.prodImageList.length > 0}>
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

                             <div className="image-widget__container" hidden={this.state.prodImageList.length === 0}>
                                {<LazadaImageView onRemoveCallback={this.onRemoveCallback}  prodImageList={this.state.prodImageList}/>}
                                <span className="image-widget__image-item image-widget__image-item--no-border">
                                    <ImageUploader
                                        hidden={this.state.prodImageList.length >= this.IMAGE_MAX_LENGTH}
                                        accept={[ImageUploadType.JPEG, ImageUploadType.PNG]}
                                        multiple={true}
                                        text={i18next.t('page.shopee.product.edit.addphoto.title')}
                                        onChangeCallback={this.onImageUploaded} />
                                </span>
                            </div>
                            
                            {/* <div className="image-widget__error-wrapper">
                                <AlertInline
                                    text={i18next.t("component.product.addNew.images.errAmountMessage_01")}
                                    type="error"
                                    nonIcon
                                    hidden={this.state.isValidImageAmount}
                                />
                            </div> */}
                        </UikWidgetContent>
                    </UikWidget>
                </ModalBody>
                <ModalFooter>
                    <GSButton secondary outline onClick={this.cancelModal}>{this.state.modalBtnCancel}</GSButton>
                    <GSButton success onClick={this.okModal}>{this.state.modalBtnOk}</GSButton>
                </ModalFooter>
            </Modal>

        );
    }
}

export default LazadaImageModal;
