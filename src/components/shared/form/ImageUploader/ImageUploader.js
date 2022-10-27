/*******************************************************************************
 * Copyright 2019 (C) Mediastep Software Inc.
 *
 * Created on : 20/03/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/

import React from "react";
import './ImageUploader.sass'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {GSToast} from "../../../../utils/gs-toast";
import i18next from "../../../../config/i18n";
import PropTypes from "prop-types";

export default class ImageUploader extends React.Component {

    constructor(props) {
        super(props);

        this.onClickAddImage = this.onClickAddImage.bind(this)
        this.onUploaderChange = this.onUploaderChange.bind(this)
        this.onChangeCallback = this.props.onChangeCallback.bind(this)

        this.refInputFile = React.createRef()
    }

    onClickAddImage() {
        this.refInputFile.current.click()
    }

    onUploaderChange(e, v) {
        let files = this.refInputFile.current.files
        if (!Array.isArray(files)) {
            files = [...files]
        }
        //filter wrong extension
        files = files.filter(file => {
            if ( this.props.accept && this.props.accept.includes(file.type)) { // => correct
                return true
            } else {
                GSToast.error(i18next.t("component.product.addNew.images.wrongFileType", {
                    fileName: file.name
                }))
                return false
            }
        })
        // filter size
        files = files.filter(file => {
            const sizeByMB = file.size / 1024 / 1024
            if (sizeByMB < this.props.maximumFileSizeByMB) { // => correct
                return true
            } else {
                GSToast.error(i18next.t("component.product.addNew.images.maximumSize", {
                    fileName: file.name,
                    size: this.props.maximumFileSizeByMB
                }))
                return false
            }
        })


        this.props.onChangeCallback(files)

        this.refInputFile.current.value = "";
    }

    render() {
        return(
            <div className="image-uploader-wrapper" onClick={this.onClickAddImage} hidden={this.props.hidden}>
                <FontAwesomeIcon icon="plus" className="image-uploader__icon"/>
                <b className="image-uploader__text">{this.props.text}</b>
                <input type="file"
                       multiple={this.props.multiple}
                       accept={this.props.accept.join(', ')}
                       ref={this.refInputFile}
                onChange={this.onUploaderChange}/>
            </div>
        )
    }
}


export const ImageUploadType = {
    PNG: 'image/png',
    JPEG: 'image/jpeg',
    GIF: 'image/gif'
}

ImageUploader.defaultProps = {
    accept: [ImageUploadType.PNG, ImageUploadType.JPEG, ImageUploadType.GIF],
    multiple: true,
    maximumFileSizeByMB: 10
}

ImageUploader.propTypes = {
  accept: PropTypes.array,
  hidden: PropTypes.any,
  multiple: PropTypes.any,
  onChangeCallback: PropTypes.any,
  text: PropTypes.any,
    maximumFileSizeByMB: PropTypes.number
}
