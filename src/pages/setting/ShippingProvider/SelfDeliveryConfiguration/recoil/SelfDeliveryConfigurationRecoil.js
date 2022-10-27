/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 09/11/2021
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/

import {atom, selector} from "recoil";
import SelfDeliveryConfiguration from "../SelfDeliveryConfiguration";

const shippingLocationListState = atom({
    key: 'shippingLocationListState',
    default: []
})


const countryListState = atom({
    key: 'countryListState',
    default: []
})

const countryMapState = atom({
    key: 'countryMapState',
    default: {}
})


export const SelfDeliveryConfigurationRecoil = {
    shippingLocationListState,
    countryListState,
    countryMapState
}
