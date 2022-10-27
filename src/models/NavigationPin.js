/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 09/08/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
export class NavigationPin {
    constructor(nav, path, component) {
        this._nav = nav
        this._path = path
        this._component = component
    }


    get nav() {
        return this._nav
    }


    get path() {
        return this._path;
    }

    set path(value) {
        this._path = value;
    }

    get component() {
        return this._component;
    }

    set component(value) {
        this._component = value;
    }
}
