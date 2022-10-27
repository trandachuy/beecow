/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 04/04/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import {ImageModel} from "../components/shared/model";

const getOrientation = (file, callback) => {
    if(file.type) {
        let reader = new FileReader();

        reader.onload = (event) => {

            if (!event.target) {
                return;
            }

            const file = event.target;
            const view = new DataView(file.result);

            if (view.getUint16(0, false) != 0xFFD8) {
                return callback(-2);
            }

            const length = view.byteLength;
            let offset = 2;

            while (offset < length) {
                if (view.getUint16(offset + 2, false) <= 8) return callback(-1);
                let marker = view.getUint16(offset, false);
                offset += 2;

                if (marker == 0xFFE1) {
                    if (view.getUint32(offset += 2, false) != 0x45786966) {
                        return callback(-1);
                    }

                    let little = view.getUint16(offset += 6, false) == 0x4949;
                    offset += view.getUint32(offset + 4, little);
                    let tags = view.getUint16(offset, little);
                    offset += 2;
                    for (let i = 0; i < tags; i++) {
                        if (view.getUint16(offset + (i * 12), little) == 0x0112) {
                            return callback(view.getUint16(offset + (i * 12) + 8, little));
                        }
                    }
                } else if ((marker & 0xFF00) != 0xFF00) {
                    break;
                } else {
                    offset += view.getUint16(offset, false);
                }
            }
            return callback(-1);
        };
        reader.readAsArrayBuffer(file);
    }
};

// Size value can be 50 (width 50px) or 100x50 (width 100px, height 50px)
const getImageUrlFromImageModel = (imageModel, sizes) => {
    if(!imageModel) return '';
    if (imageModel.url) {
        return imageModel.url
    }
    let imageUrl = '';
    if (imageModel && imageModel.urlPrefix) {
        imageUrl += imageModel.urlPrefix + '/';
        if (sizes) {
            imageUrl += sizes + '/';
        }
        let imageName;
        if (imageModel.imageUUID) {
            imageName = imageModel.imageUUID;
        } else {
            imageName = `${imageModel.imageId}`;
        }
        if (imageModel.extension) {
            imageName += `.${imageModel.extension}`;
        } else {
            imageName += '.jpg';
        }
        imageUrl += imageName;
    }

    return imageUrl;
};

const mapImageUrlToImageModel = (imageUrl) => {
    let separateIndex = imageUrl.lastIndexOf('/');
    let urlPrefix = separateIndex >= 0 ? imageUrl.substring(0, separateIndex) : imageUrl;
    let imageName, imageId, imageUuid, extension;
    if (separateIndex >= 0) {
        imageName = imageUrl.substring(separateIndex + 1);
        let extensionIndex = imageName.lastIndexOf('.');
        imageUuid = extensionIndex >= 0 ? imageName.substring(0, extensionIndex) : imageName;
        if (!isNaN(imageUuid)) {
            imageId = imageUuid;
            imageUuid = undefined;
        }
        extension = imageName.substring(extensionIndex + 1);
    }
    return new ImageModel(imageId, imageUuid, urlPrefix, extension);
};

const ellipsisFileName = (fileName, maxLength = 20) => {
    if (fileName.length > maxLength - 3) {
        const midPoint = Math.floor(maxLength / 2)
        const leftPart = fileName.substring(0, midPoint - 3)
        const rightPart = fileName.substring(fileName.length - midPoint, fileName.length)
        return leftPart + '...' + rightPart
    } else {
        return fileName
    }
}

const extractImageModel = (bcItem) => {
    let imageModel;
    if (bcItem.image) {
        const { urlPrefix, imageUUID, extension } = bcItem.image;
        imageModel = {
            urlPrefix: urlPrefix,
            imageId: imageUUID,
            extension
        };
    }
    else {
        const {imageUrlPrefix, itemImageImageId} = bcItem;
        imageModel = {
            urlPrefix: imageUrlPrefix,
            imageId: itemImageImageId,
        };
    }
    return imageModel;
}

const getImageNameFromImageModel = (imageModel) => {
    let fileName = '';
    if (!imageModel.imageId) {
        return '';
    }
    else {
        fileName += imageModel.imageId;
        fileName += `${fileName}.${imageModel.extension ? imageModel.extension : 'jpg'}`;
        return fileName;
    }
}

const getFileNameUrlFromFileModel = (fileModel) => {
    return fileModel.urlPrefix + '/' + fileModel.name + '.' + fileModel.extension
}

const resizeImage = (imageUrl, size) => {
    if (isNaN(size)) {
        return imageUrl;
    }
    return ImageUtils.getImageFromImageModel(ImageUtils.mapImageUrlToImageModel(imageUrl), size);
}

export const ImageUtils = {
    getOrientation,
    getImageFromImageModel: getImageUrlFromImageModel,
    mapImageUrlToImageModel,
    ellipsisFileName,
    getImageNameFromImageModel,
    resizeImage,
    extractImageModel,
    getFileUrlFromFileModel: getFileNameUrlFromFileModel
};
