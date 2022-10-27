/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 29/08/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React, {useRef} from 'react';
import PropTypes from 'prop-types';
import GSButton from "../GSButton/GSButton";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import GSTrans from "../GSTrans/GSTrans";
import {GSToast} from "../../../utils/gs-toast";
import i18next from "../../../config/i18n";
import {ImageUploadType} from "../form/ImageUploader/ImageUploader";
import {ImageUtils} from "../../../utils/image";

const MAX_FILE_NAME = 30

const GSButtonUpload = props => {
    const refUploadInput = useRef(null);

    const onClickUploadButton = (e) => {
        e.preventDefault()
        refUploadInput.current.click()
    }

    const onFileUploaded = (e) => {
        let files = refUploadInput.current.files
        if (!Array.isArray(files)) {
            files = [...files]
        }
        //filter wrong extension
        files = files.filter(file => {
            if ( props.accept && props.accept.includes(file.type)) { // => correct
                return true
            } else {
                GSToast.error(i18next.t("component.product.addNew.images.wrongFileType", {
                    fileName: ImageUtils.ellipsisFileName(file.name, MAX_FILE_NAME)
                }))
                return false
            }
        })
        // filter size
        files = files.filter(file => {
            const sizeByMB = file.size / 1024 / 1024
            if (sizeByMB < props.maxImageSizeByMB) { // => correct
                return true
            } else {
                GSToast.error(i18next.t("component.product.addNew.images.maximumSize", {
                    fileName: ImageUtils.ellipsisFileName(file.name, MAX_FILE_NAME),
                    size: props.maxImageSizeByMB
                }))
                return false
            }
        })

        if (props.onUploaded) props.onUploaded(files);
        refUploadInput.current.value = "";
    }
    const {text, icon,multiple, accept, maxImageHeight, maxImageSizeByMB, maxImageWidth, onUploaded, ...other} = props
    return (
        <>
            <GSButton default icon={icon? icon:<FontAwesomeIcon icon={"upload"}/>} {...other}
                      onClick={onClickUploadButton}>
                {text? text:<GSTrans t={"common.btn.upload"}/>}
            </GSButton>

            <input type="file"
                   accept={props.accept.join(', ')}
                   ref={refUploadInput}
                   onChange={onFileUploaded}
                    multiple={multiple}
            />
        </>
    );
};

GSButtonUpload.defaultProps = {
    accept: [ImageUploadType.JPEG, ImageUploadType.PNG,ImageUploadType.GIF],
    maxImageSizeByMB: 10,
    multiple: false
}

GSButtonUpload.propTypes = {
    text: PropTypes.string,
    icon: PropTypes.any,
    accept: PropTypes.array,
    maxImageSizeByMB: PropTypes.number,
    onUploaded: PropTypes.func.isRequired,
    multiple: PropTypes.bool,
};

export default GSButtonUpload;
