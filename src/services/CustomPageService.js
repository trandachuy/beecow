/*
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 12/07/2019
 * Author: Tien Dao <email: tien.dao@mediastep.com>
 */
import apiClient from '../config/api';
import Constants from "../config/Constant";
import storageService from "./storage";

class CustomPageService {

    getCustomPagesByStoreId(params) {
        const storeId = storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_ID);
        return new Promise((resolve, reject) => {
            apiClient.get(`${Constants.SSR_STOREFRONT}/api/custom-pages/${storeId}`, {params: params})
                .then(response => resolve(response))
                .catch(e => reject(e))
        });
    }

    getCustomPagesForMenu(params) {
        const storeId = storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_ID);
        return new Promise((resolve, reject) => {
            apiClient.get(`${Constants.SSR_STOREFRONT}/api/custom-pages/menu/${storeId}`, {params: params})
                .then(response => resolve(response))
                .catch(e => reject(e))
        });
    }

    getAuthors() {
        const storeId = storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_ID);
        return new Promise((resolve, reject) => {
            apiClient.get(`${Constants.SSR_STOREFRONT}/api/custom-pages/${storeId}/authors`)
                .then(response => resolve(response))
                .catch(e => reject(e))
        });
    }

    getCustomPageById(pageId){
        const storeId = storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_ID);
        return new Promise((resolve, reject) => {
            apiClient.get(`${Constants.SSR_STOREFRONT}/api/custom-pages/${storeId}/${pageId}`)
                .then(response => resolve(response))
                .catch(e => reject(e))
        });
    }

    getCustomPageForMenuById(pageId){
        const storeId = storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_ID);
        return new Promise((resolve, reject) => {
            apiClient.get(`${Constants.SSR_STOREFRONT}/api/custom-pages/menu/${storeId}/${pageId}`)
                .then(response => resolve(response))
                .catch(e => reject(e))
        });
    }

    createCustomPage(data) {
        const storeId = storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_ID);
        return new Promise((resolve, reject) => {
            apiClient.post(`${Constants.SSR_STOREFRONT}/api/custom-pages/${storeId}`, data)
                .then(response => resolve(response))
                .catch(e => reject(e))
        });
    }

    updatePage(data) {
        const storeId = storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_ID);
        return new Promise((resolve, reject) => {
            apiClient.put(`${Constants.SSR_STOREFRONT}/api/custom-pages/${storeId}`, data)
                .then(response => resolve(response))
                .catch(e => reject(e))
        });
    }

    deletePage(pageId) {
        const storeId = storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_ID);
        return new Promise((resolve, reject) => {
            apiClient.delete(`${Constants.SSR_STOREFRONT}/api/custom-pages/${storeId}/${pageId}`)
                .then(response => resolve(response))
                .catch(e => reject(e))
        });
    }

    loadListLanguageByPageId(pageId) {
        return new Promise((resolve, reject) => {
            apiClient.get(`${Constants.SSR_STOREFRONT}/api/custom-page-languages/${pageId}`)
                .then(response => resolve(response.data))
                .catch(e => reject(e))
        });
    }

    updateCustomPageLanguage(data) {
        const storeId = storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_ID);
        return new Promise((resolve, reject) => {
            apiClient.put(`${Constants.SSR_STOREFRONT}/api/custom-page-languages/save/${storeId}`, data)
                .then(response => resolve(response.data))
                .catch(e => reject(e))
        });
    }
}
const customPageService = new CustomPageService();
export default customPageService;
