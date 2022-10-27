import apiClient from '../config/api';
import Constants from "../config/Constant";
import _ from 'lodash';

class MediaService {

    uploadFile(files) {
        return new Promise((resolve, reject) => {
            let data = new FormData();
            _.each(files, x => {
                data.append('files', x);
            });

            apiClient.post(`/${Constants.MEDIA_SERVICE}/api/uploads?domain=BANNER`, data)
                .then(result => {
                    if (result.data) {
                        resolve(result.data);
                    }
                })
                .catch(e => {
                    reject(e);
                });
        });
    }
    uploadFilesWithDomain(files, domain) {
        let data = new FormData();
        _.each(files, x => {
            data.append('files', x);
        });
        return new Promise((resolve, reject) => {
            let timeOut = setTimeout( () => {
                reject('timeOut')
            }, 30000)
            apiClient.post(`/${Constants.MEDIA_SERVICE}/api/uploads?domain=${domain}`, data)
                .then(result => {
                    clearTimeout(timeOut)
                    if (result.data) {
                        resolve(result.data);
                    }
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    uploadFileWithDomain(file, domain) {
        let dataForm = new FormData()
        dataForm.append('files', file)

        return new Promise((resolve, reject) => {
            let timeOut = setTimeout( () => {
                reject('timeOut')
            }, 30000)

            apiClient.post(`/${Constants.MEDIA_SERVICE}/api/uploads?domain=${domain}`, dataForm)
                .then(result => {
                    clearTimeout(timeOut)
                    if (result.data) {
                        resolve(result.data[0]);
                       // console.log(result)
                    }
                })
                .catch(e => {
                    reject(e);
                });
        });
    }
}

export const MediaServiceDomain = {
    BANNER: 'BANNER',
    GENERAL: 'GENERAL',
    ITEM: 'ITEM',
    STORE_LOGO: 'STORE_LOGO',
    APP_ICON: 'APP_ICON',
    FILE: 'DOC'
}

const mediaService = new MediaService();
export default mediaService;
