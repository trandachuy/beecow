import React from "react";
import './GSModalUploadImage.sass'
import ModalCustom from "../ModelCustom";
import {ModalBody, ModalFooter, ModalHeader} from "reactstrap";
import _ from "lodash";
import GSTrans from "../../GSTrans/GSTrans";
import GSButton from "../../GSButton/GSButton";
import ImageUploader, {ImageUploadType} from "../../form/ImageUploader/ImageUploader";
import PropTypes from "prop-types";
import ImageBox from "./ImageBox";
import {GSToast} from "../../../../utils/gs-toast";
import i18next from "../../../../config/i18n";
import GSActionButton, {GSActionButtonIcons} from "../../GSActionButton/GSActionButton";
import MediaService, {MediaServiceDomain} from "../../../../services/MediaService";
import {ItemService} from "../../../../services/ItemService";

export default class GSModalUploadImage extends React.Component {
    constructor(props) {
        super(props);
        this.IMAGE_MAX_SIZE_BY_MB = 10;
        this.IMAGE_LIST_MAX_SIZE = 50;
        this.state = {
            isShow: false,
            images: this.props.imgList,
            imgChoose: {},
            imgChooseIndex: null,
            imgDefaultIndex: null
        }
        this.toggle = this.toggle.bind(this);
        this.onImageUploaded = this.onImageUploaded.bind(this);
        this.onSave = this.onSave.bind(this);
        this.getImgList = this.getImgList.bind(this);
        this.onRemovePicture = this.onRemovePicture.bind(this);
        this.callbackChooseImage = this.callbackChooseImage.bind(this);
    }
    componentDidMount() {
        this.setState({
            imgChoose: this.props.imgChoose,
        })
    }
    openModal(options) {
        this.setState(_.extend({
            isShow: true,
        }, options));
    }
    toggle() {
        this.setState({
            isShow: !this.state.isShow
        })
    }

    onImageUploaded(files) {
        if(files.length == 0) return;
        let file = files[0];

        if (this.props.callbackMode === 'outerChange') {    // let validate from outside
            if (this.props.onImageUploaded) {
                this.props.onImageUploaded(files)
            }

            // choose the last
            this.onChooseImageMain(file, this.props.imgList.length)
        } else {
            let valid = true
            //filter wrong extension
            if ( ![ImageUploadType.JPEG, ImageUploadType.PNG,ImageUploadType.GIF].includes(file.type)) { // => correct
                GSToast.error(i18next.t("component.product.addNew.images.wrongFileType", {
                    fileName: file.name
                }))
                valid = false
            }
            if (file.size / 1024 / 1024 > this.IMAGE_MAX_SIZE_BY_MB) {
                GSToast.error(i18next.t("component.product.addNew.images.maximumSize", {
                    fileName: file.name,
                    size: this.IMAGE_MAX_SIZE_BY_MB
                }))
                valid = false
            }
            if(valid) {
                let tArr = [...this.state.images, file];
                this.setState({
                   images: [...tArr]
                },()=>{
                    this.onChooseImageMain(file, this.state.images.length-1)
                })
            }
        }
    }

    onSave() {
        /**
         * {
         *     imgObj: File or ImageObj,
         *     index: image's index
         * }
         */
        
        if(this.props.callbackMode == 'outerChange') {
            this.callbackChooseImage({
                imgObj: this.state.imgChoose,
                index: this.state.imgChooseIndex
            })
        } else {
            let newListImgs = []
            let oldImages = this.state.images.filter(x => (x.imageId && x.imageId != 0) || (x.imageUUID && x.imageUUID != 0))
            newListImgs =  [...oldImages];
            let newImages = this.state.images.filter(x => !x.imageId && !x.imageUUID)
            if(newImages && newImages.length != 0) {
                MediaService.uploadFilesWithDomain(newImages, MediaServiceDomain.GENERAL)
                    .then((res) => {
                        ItemService.uploadImagesForProduct({listImage: res}, this.props.itemId)
                            .then(result => {
                                newListImgs = [...newListImgs, ...result];
                                this.setState({
                                    images: newListImgs,
                                    imgChoose: newListImgs[this.state.imgChooseIndex]
                                }, ()=>{
                                    this.callbackChooseImage({
                                        imgObj: this.state.imgChoose,
                                        index: this.state.imgChooseIndex,
                                        images: this.state.images
                                    })
                                })
                            }).catch(()=>{
                                GSToast.commonError();
                        })
                    }).catch(()=>{
                    GSToast.commonError();
                })
            } else {
                this.callbackChooseImage({
                    imgObj: this.state.imgChoose,
                    index: this.state.imgChooseIndex
                })
            }
        }
    }

    callbackChooseImage(obj) {
        this.props.chooseImageAction(obj)
        this.toggle();
    }

    onChooseImageMain(image, idx){
        this.setState({
            imgChoose: image,
            imgChooseIndex: idx
        })
    }

    getImgList() {
        return this.props.callbackMode === 'outerChange' ? this.props.imgList : this.state.images;
    }

    onRemovePicture() {
        this.props.chooseImageAction({
            imgObj: null,
            index: null
        })
        this.toggle();
    }

    render() {
        return(
            <div className="gs-modal">
                    <ModalCustom size="lg" style={{margin: 'auto'}}
                                 isOpen={this.state.isShow}
                                 centered={true}
                                 fade={false}
                                 wrapClassName="gs-modal-upload-image"
                    >
                        <ModalHeader toggle={this.toggle}
                                     className={'upload-modal-header'}
                                     charCode=""
                                     close={
                                         <GSActionButton icon={GSActionButtonIcons.CLOSE} width='1rem' onClick={this.toggle}/>
                                     }>
                            {this.props.modalTitle?
                                this.props.modalTitle
                                :
                                <GSTrans t={"modal.variation.upload.photos"} >
                                    Choose photos for version
                                </GSTrans>
                            }
                        </ModalHeader>
                        <ModalBody className={'image-widget__container'}>
                            { this.getImgList().map((img, idx) => {
                                    return (<ImageBox
                                        key={(img.id ? img.id : img.name) + '-' + idx}
                                        src={img}
                                        arrIndex={idx}
                                        formModal={true}
                                        isMain={idx === this.state.imgChooseIndex}
                                        onChooseSetMainCallback={()=>this.onChooseImageMain(img, idx )}
                                        />)
                                    })
                            }
                            <span className="image-widget__image-item image-widget__image-item--no-border" hidden={this.props.callbackMode === 'innerChange' && this.state.images.length === this.IMAGE_LIST_MAX_SIZE}>
                            <ImageUploader
                                accept={[ImageUploadType.JPEG, ImageUploadType.PNG,ImageUploadType.GIF]}
                                multiple={false}
                                text="Add more photo"
                                maximumFileSizeByMB={this.IMAGE_MAX_SIZE_BY_MB}
                                onChangeCallback={this.onImageUploaded} />
                            </span>
                        </ModalBody>
                        <ModalFooter>
                            {this.state.imgChooseIndex !== null && this.state.imgChooseIndex !== undefined && this.state.imgDefaultIndex === this.state.imgChooseIndex &&
                                <GSButton outline danger className="mr-auto" onClick={this.onRemovePicture}>
                                    <GSTrans t={"page.product.create.variation.btn.removePicture"}/>
                                </GSButton>
                            }
                            <GSButton secondary outline onClick={this.toggle}>
                                <GSTrans t={"common.btn.cancel"}/>
                            </GSButton>
                            <GSButton success marginLeft onClick={this.onSave} disabled={this.state.imgChooseIndex === null || this.state.imgChooseIndex === undefined}>
                                {this.props.okBtnText? this.props.okBtnText:<GSTrans t={"common.btn.save"}/>}
                            </GSButton>
                        </ModalFooter>
                    </ModalCustom>
            </div>
        )
    }
}



GSModalUploadImage.defaultProps = {
    itemId: 0,
    imgChoose: {
        id: -1
    }
}

GSModalUploadImage.propTypes = {
    itemId: PropTypes.any,
    chooseImageAction: PropTypes.func,
    imgChoose: PropTypes.any,
    imgList: PropTypes.array,
    onImageUploaded: PropTypes.func,
    callbackMode: PropTypes.oneOf(['innerChange','outerChange']),
    modalTitle: PropTypes.string,
    okBtnText: PropTypes.string,
}
