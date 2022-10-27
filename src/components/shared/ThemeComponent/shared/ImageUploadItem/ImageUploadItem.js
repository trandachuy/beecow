/*******************************************************************************
 * Copyright 2019 (C) Mediastep Software Inc.
 *
 * Created on : 26/08/2019
 * Author: Tien Dao <tien.dao@mediastep.com>
 *******************************************************************************/
import React from "react";
import './ImageUploadItem.sass'
import {GSToast} from "../../../../../utils/gs-toast";
import AlertInline, {AlertInlineType} from "../../../AlertInline/AlertInline";
import i18next from "i18next";
import {ImageUtils} from "../../../../../utils/image";
import GSButton from "../../../GSButton/GSButton";


export default class UploadImageItem extends React.Component {

    /*
    * PROPS
    *
    * 1. url : url of image
    * 2. callBackFunction(
    *       indexGroup : group position from props,
    *       indexSchema : schema position from props,
    *       file : file of image for parent component. This value can be undefined
    *    )
    * 3. validateRule: object to validation
    *     
    */

    maximumFileSizeByMB = 10 // maximum size 10MB
    accept = ["image/png","image/jpeg"] // only accept file
    defaultImage = "/assets/images/default_image2.png" // default image

    state = {
        editImageLoad: '', // url in case edit
        imageURL: this.defaultImage,
        imageName: '',
        o9n: '',
        isError: false
    }

    constructor(props) {
        super(props)

        this.refInputFile = React.createRef()
        
        this.isValid = this.isValid.bind(this)
        this.openFolder = this.openFolder.bind(this)
        this.onUploaderChange = this.onUploaderChange.bind(this)
        this.deleteImage = this.deleteImage.bind(this)

    }

    componentDidMount() {
        if(this.props.url){
            this.setState({
                editImageLoad: this.props.url,
                imageURL: this.props.url,
                imageName: this.props.url
            })
        }
    }

    openFolder(e){
        e.preventDefault()
        this.refInputFile.current.click()
    }

    deleteImage(){
        this.setState({
            editImageLoad: '',
            imageURL: this.defaultImage,
            imageName: '',
            isError : this.props.validateRule.isRequired
        })

        this.props.callBackFunction(this.props.indexGroup, this.props.indexSchema, undefined)
    }

    onUploaderChange(e, v) {
        e.preventDefault()
        let file = this.refInputFile.current.files[0]

        //filter wrong extension
        if (!this.accept.includes(file.type)) { // => correct
            GSToast.error(i18next.t("component.product.addNew.images.wrongFileType", {fileName: file.name}))
            return false
        }

        // filter size
        const sizeByMB = file.size / 1024 / 1024
        if (sizeByMB > this.maximumFileSizeByMB) { // => correct
            GSToast.error(i18next.t("component.product.addNew.images.maximumSize", {fileName: file.name, size: this.maximumFileSizeByMB}))
            return false
        }

        this.refInputFile.current.value = "";

        ImageUtils.getOrientation(file, (o9n => {
            this.setState({
                editImageLoad: '',
                imageURL: URL.createObjectURL(file),
                imageName: file.name,
                o9n: o9n,
                isError : false
            })
        }))

        this.props.callBackFunction(this.props.indexGroup, this.props.indexSchema, {isFile: true, file: file})
    }

    isValid(){

        if(!this.state.editImageLoad){
            // in case no image url or name
            if(!this.state.imageURL || (this.state.imageURL && this.state.imageURL === this.defaultImage) ){
                this.setState({isError : this.props.validateRule.isRequired})
                return !this.props.validateRule.isRequired
            }else{
                // in case no error
                this.setState({isError : false})
                // no need to call callback here: when create file => update to parent component
                return true
            }
        }else{
            // in case no error
            this.setState({isError : false})
            this.props.callBackFunction(this.props.indexGroup, this.props.indexSchema, {isFile: false, file: this.state.editImageLoad})
            return true
        }
    }

    render() {
        return (
            <>

            <div className="upload-image__item">
                <div className="image-preview">

                    {/* PREVIEW ZONE */}
                    <img 
                        className={"photo " + 'photo--o9n-' + this.state.o9n}
                        width="137px"
                        height="137px"
                        src={this.state.imageURL} 
                    />
                </div>
                <div className="image-upload">
                    <div className="image-upload__button">
                        {/* UPLOAD BUTTON */}
                        <GSButton 
                            default
                            icon={( <i></i>)}
                            onClick={this.openFolder}
                            className="button-upload"
                        >
                            {i18next.t('common.btn.upload')}
                        </GSButton>

                        <input 
                            type="file" 
                            accept={this.accept.join(', ')}
                            ref={this.refInputFile}
                            onChange={this.onUploaderChange}
                        />
                    </div>

                    
                </div>
                {
                    this.state.imageName &&
                    <div className="image-upload__name">
                        <i className="close-icon" onClick={this.deleteImage}/>
                        {/* FILE NAME */}
                        {this.state.imageName}
                    </div>
                }
                <div>
                    {
                        this.state.isError &&
                        <AlertInline 
                            className="upload-image__item-error"
                            type={AlertInlineType.ERROR}
                            nonIcon
                            text={i18next.t('common.validation.required')}/>
                    }
                </div>
            </div>
      
             </>
        )
    }

}




