/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 14/10/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import {CredentialUtils} from "./credential";

const buildBannerLink = (linkTo, linkToValue) => {
    const storeUrl = CredentialUtils.getStoreUrl();
    const domain = process.env.STOREFRONT_DOMAIN;
    const storefrontRoot =  `https://${storeUrl}.${domain}`;

    switch(linkTo) {
        case 'COLLECTION':
            return storefrontRoot + '/product?co=' + linkToValue
        case 'PAGE':
            return storefrontRoot + '/page/' + linkToValue
        case 'PRODUCT':
            return storefrontRoot + '/product/' + linkToValue
    }
}

export const StoreFrontUtils = {
    buildBannerLink
}
