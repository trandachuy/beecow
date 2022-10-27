/*
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 01/07/2019
 * Author: Long Phan <email: long.phan@mediastep.com>
 */
import apiClient from '../config/api';
import Constants from "../config/Constant";

class MenuService {
    
    getMenuByBcStoreId(params) {
        return new Promise((resolve, reject) => {
            apiClient.get(`${Constants.ITEM_SERVICE}/api/menus`, {params: params})
                .then(response => resolve(response))
                .catch(e => reject(e))
        });
    }

    getMenuByBcStoreIdByPage(params) {
        return new Promise((resolve, reject) => {
            apiClient.get(`${Constants.ITEM_SERVICE}/api/menus`, {params: params})
                .then(response => resolve(response))
                .catch(e => reject(e))
        });
    }

    getMenuById(menuId){
        return new Promise((resolve, reject) => {
            apiClient.get(`${Constants.ITEM_SERVICE}/api/menus/${menuId}`)
                .then(response => resolve(response.data))
                .catch(e => reject(e))
        });
    }
    createMenu(data) {
        return new Promise((resolve, reject) => {
            apiClient.post(`${Constants.ITEM_SERVICE}/api/menus`, data)
                .then(response => resolve(response.data))
                .catch(e => reject(e))
        });
    }
    updateMenu(data) {
        return new Promise((resolve, reject) => {
            apiClient.put(`${Constants.ITEM_SERVICE}/api/menus`, data)
                .then(response => resolve(response.data))
                .catch(e => reject(e))
        });
    }
    deleteById(menuId){
        return new Promise((resolve, reject) => {
            apiClient.delete(`${Constants.ITEM_SERVICE}/api/menus/${menuId}`)
                .then(response => resolve(response.data))
                .catch(e => reject(e))
        });
    }
}

const menuService = new MenuService();
export default menuService;
