/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 15/09/2021
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/


import {atom, selector} from "recoil";
import {FbPageStatus} from "./FbPageConfiguration";

const fbUserState = atom({
    key: 'fbUserState',
    default: {}
})

const mainPageState = atom({
    key: 'mainPageState',
    default: 0
})

const loadingState = atom({
    key: 'loadingState',
    default: true
})

const connectingState = atom({
    key: 'connectingState',
    default: false
})

const savingState = atom({
    key: 'savingState',
    default: false
})

const fbSavedPageListState = atom({
    key: 'fbSavedPageListState',
    default: [],
});

const fbSavedPageConnectedListState = selector({
    key: 'fbSavedPageConnectedListState',
    get: ({get}) => {
        const list = get(fbSavedPageListState);
        return list.filter(page => page.usingStatus === FbPageStatus.APPROVE)
    }
})

const fbSavedPageUnconnectedListState = selector({
    key: 'fbSavedPageUnconnectedListState',
    get: ({get}) => {
        const list = get(fbSavedPageListState);
        return list.filter(page => page.usingStatus === FbPageStatus.UNCONNECTED)
    }
})

export const FbPageConfigurationRecoil = {
    fbSavedPageListState,
    fbSavedPageConnectedListState,
    fbSavedPageUnconnectedListState,
    loadingState,
    savingState,
    fbUserState,
    mainPageState
}