/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 29/08/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React from 'react';
import PropTypes from 'prop-types';
import style from './ThemeLogoUploaderItem.module.sass'
import {StoreLogoModel} from "../../../model/StoreLogoModel";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import i18next from "../../../../../config/i18n";
import {ImageUploadType} from "../../../form/ImageUploader/ImageUploader";
import GSButtonUpload from "../../../GSButtonUpload/GSButtonUpload";
import GSImg from "../../../GSImg/GSImg";
import {ImageUtils} from "../../../../../utils/image";
import AlertInline, {AlertInlineType} from "../../../AlertInline/AlertInline";

export const IMAGE_RECOMMEND = {
    WIDTH: 1000,
    HEIGHT: 1000,
    ACCEPT: [{
        name: 'JPEG',
        enum: ImageUploadType.JPEG
    }, {
        name: 'PNG',
        enum: ImageUploadType.PNG
    }, {
        name: 'GIF',
        enum: ImageUploadType.GIF
    }]
}

export const LOADING_SCREEN_RECOMMEND = {
    WIDTH: 1080,
    HEIGHT: 1920,
    ACCEPT: [{
        name: 'JPEG',
        enum: ImageUploadType.JPEG
    }, {
        name: 'PNG',
        enum: ImageUploadType.PNG
    }, {
        name: 'GIF',
        enum: ImageUploadType.GIF

    }, {
        name: 'GIF',
        enum: ImageUploadType.GIF
    }]
}

export const MAX_FILE_NAME_LENGTH = 30

/*
* PROPS
*
* 1. model : image object
* 2. callBackFunction(
*       type : name of image - from props
*       file : return file for parent
*    )
* 3. isRequired  props
* 4. type : "APP_LOGO", "FAVICON", "SHOP_LOGO", "LOADING_SCREEN props
*
*/

export default class ThemeLogoUploaderItem extends React.Component {

    state = {
        file: undefined,
        isError: false,
        // urlName: '',
        // urlPrefix: '',
        imageModel: undefined,
        isRequired: this.props.isRequired === false ? false : true
    }

    constructor(props) {
        super(props);

        this.onFileUploaded = this.onFileUploaded.bind(this);
        this.onRemoveImage = this.onRemoveImage.bind(this);
        this.isValid = this.isValid.bind(this)
    }

    componentDidMount() {
        let urlName = ''
        if (this.props.model && (this.props.model.imageId || this.props.model.imageUUID)) {
            urlName = ImageUtils.getImageNameFromImageModel(this.props.model);
            this.setState({
                urlName: urlName,
                // urlPrefix: this.props.model.urlPrefix,
                imageModel: this.props.model
            })
        }
    }

    onFileUploaded(files) {
        this.setState({
            file: files[0],
            isError: false
        })
        this.props.callBackFunction(this.props.type, files[0])
    }

    onRemoveImage() {
        let isRequired = this.state.isRequired
        this.setState({
            file: undefined,
            isError: isRequired ? true : false,
            urlName: '',
            imageModel: undefined
        })
        this.props.callBackFunction(this.props.type, undefined)
    }

    isValid() {
        if (/*!this.state.urlName*/ !this.state.imageModel && !this.state.file) {
            let error = this.state.isRequired
            this.setState({isError: error ? true : false})
            return !error
        } else {
            this.setState({isError: false})
            return true
        }
    }

    render() {
        return (

            <>
                {/*DESKTOP*/}
                <section className={['gs-table-body-items', style.themeLogoUploaderItem].join(' ')}>
                    <div className={style.gsTableBodyItem}>
                        <div className={style.logoName}>
                            <div>
                                <b>{this.props.name}</b>
                            </div>
                            <div className={style.subTitle}>
                                {this.props.type === "LOADING_SCREEN" ?
                                    `${LOADING_SCREEN_RECOMMEND.WIDTH} x ${LOADING_SCREEN_RECOMMEND.HEIGHT}px (${LOADING_SCREEN_RECOMMEND.ACCEPT.map(item => item.name).join('/')} file)` :
                                    `${IMAGE_RECOMMEND.WIDTH} x ${IMAGE_RECOMMEND.HEIGHT}px (${IMAGE_RECOMMEND.ACCEPT.map(item => item.name).join('/')} file)`}
                            </div>
                        </div>
                    </div>
                    <div className={[style.gsTableBodyItem, style.logoUploaderCol].join(' ')}>
                        <div className={style.logoUploader}>
                            <GSButtonUpload
                                onUploaded={this.onFileUploaded}
                                accept={IMAGE_RECOMMEND.ACCEPT.map(item => item.enum)

                                }
                            />
                            {(this.state.file || this.state.urlName) &&
                            <div className={style.fileName}>
                                {
                                    ImageUtils.ellipsisFileName(
                                        this.state.file ? this.state.file.name : this.state.urlName,
                                        MAX_FILE_NAME_LENGTH
                                    )
                                }
                                <span hidden={this.props.type === "APP_LOGO"} className={style.btnRemove}
                                      onClick={this.onRemoveImage}>
                                        <FontAwesomeIcon icon={"times"}/>
                                    </span>
                            </div>
                            }
                        </div>
                        {
                            this.state.isError &&
                            <AlertInline
                                className={style.alertWrapper}
                                type={AlertInlineType.ERROR}
                                nonIcon
                                text={i18next.t('common.validation.required')}/>
                        }
                    </div>
                    <div className={[style.gsTableBodyItem].join(' ')}>
                        <div className={style.logoPreview}>
                            <GSImg src={
                                this.state.file
                                    ? this.state.file
                                    : this.state.imageModel
                                    ? ImageUtils.getImageFromImageModel(this.state.imageModel, 50)
                                    // : this.state.urlName
                                    // ? this.state.urlPrefix + "/" + this.state.urlName
                                    : undefined
                            }
                                   width={50}
                                   height={50}/>
                        </div>
                    </div>
                </section>
            </>
        );
    }
};

ThemeLogoUploaderItem.propTypes = {
    model: PropTypes.instanceOf(StoreLogoModel),
    name: PropTypes.string.isRequired
};

