/*
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 12/07/2019
 * Author: Tien Dao <email: tien.dao@mediastep.com>
 */
import apiClient from '../config/api';
import Constants from "../config/Constant";
import storageService from "./storage";

class PageService {
    
    getPagesByBcStoreId(params) {
        const storeId = storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_ID);
        return new Promise((resolve, reject) => {
            apiClient.get(`${Constants.ITEM_SERVICE}/api/pages/list/${storeId}`, {params: params})
                .then(response => resolve(response))
                .catch(e => reject(e))
        });
    }

    getTemplates() {
        const storeId = storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_ID);
        return new Promise((resolve, reject) => {
            apiClient.get(`${Constants.ITEM_SERVICE}/api/pages/list/template/${storeId}`)
                .then(response => resolve(response))
                .catch(e => reject(e))
        });
    }

    getPageById(pageId){
        const storeId = storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_ID);
        return new Promise((resolve, reject) => {
            apiClient.get(`${Constants.ITEM_SERVICE}/api/pages/detail/${storeId}/${pageId}`)
                .then(response => resolve(response))
                .catch(e => reject(e))
        });
    }

    getTemplateDetail(pageId){
        const storeId = storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_ID);
        return new Promise((resolve, reject) => {
            apiClient.get(`${Constants.ITEM_SERVICE}/api/pages/detail/template/${storeId}/${pageId}`)
                .then(response => resolve(response))
                .catch(e => reject(e))
        });
    }
    
    createPage(data) {
        const storeId = storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_ID);
        return new Promise((resolve, reject) => {
            apiClient.post(`${Constants.ITEM_SERVICE}/api/pages/create/${storeId}`, data)
                .then(response => resolve(response))
                .catch(e => reject(e))
        });
    }

    updatePage(data) {
        const storeId = storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_ID);
        return new Promise((resolve, reject) => {
            apiClient.put(`${Constants.ITEM_SERVICE}/api/pages/update/${storeId}`, data)
                .then(response => resolve(response))
                .catch(e => reject(e))
        });
    }

    deletePage(pageId) {
        const storeId = storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_ID);
        return new Promise((resolve, reject) => {
            apiClient.delete(`${Constants.ITEM_SERVICE}/api/pages/delete/${storeId}/${pageId}`)
                .then(response => resolve(response))
                .catch(e => reject(e))
        });
    }
}

const pageService = new PageService();
export default pageService;
