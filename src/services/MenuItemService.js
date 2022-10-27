/*
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 01/07/2019
 * Author: Long Phan <email: long.phan@mediastep.com>
 */
import apiClient from '../config/api';
import Constants from "../config/Constant";

class MenuItemService {
    getMenuItemsByMenuId(menuId) {
        return new Promise((resolve, reject) => {
            apiClient.get(`${Constants.ITEM_SERVICE}/api/menus/${menuId}/menu-items?type=ALL`)
                .then(response => resolve(response.data))
                .catch(e => reject(e))
        });
    }

    createMenuItem(data){
        return new Promise((resolve, reject) => {
            apiClient.post(`${Constants.ITEM_SERVICE}/api/menu-items`, data)
                .then(response => resolve(response.data))
                .catch(e => reject(e))
        });
    }

    updateMenuItem(data){
        return new Promise((resolve, reject) => {
            apiClient.put(`${Constants.ITEM_SERVICE}/api/menu-items`, data)
                .then(response => resolve(response.data))
                .catch(e => reject(e))
        });
    }
    updateMenuItems(data){
        return new Promise((resolve, reject) => {
            apiClient.put(`${Constants.ITEM_SERVICE}/api/menu-items/items`, data)
                .then(response => resolve(response.data))
                .catch(e => reject(e))
        });
    }
    deleteMenuItems(params){
        return new Promise((resolve, reject) => {
            apiClient.delete(`${Constants.ITEM_SERVICE}/api/menu-items`, {params: params})
                .then(response => resolve(response.data))
                .catch(e => reject(e))
        });
    }
}

const menuItemService = new MenuItemService();
export default menuItemService;
