/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 29/08/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
export class StoreLogoModel {

    constructor({imageId, urlPrefix, extension, imageUUID}) {
        this._imageId = imageId;
        this._urlPrefix = urlPrefix;
        this._extension = extension;
        this._imageUUID = imageUUID;
    }

    get imageId() {
        return this._imageId;
    }

    set imageId(value) {
        this._imageId = value;
    }

    get urlPrefix() {
        return this._urlPrefix;
    }

    set urlPrefix(value) {
        this._urlPrefix = value;
    }

    get extension() {
        return this._extension;
    }

    set extension(value) {
        this._extension = value;
    }

    get imageUUID() {
        return this._imageUUID;
    }

    set imageUUID(value) {
        this._imageUUID = value;
    }
}
