/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 24/05/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import './StoreFrontInfo.sass'
import storageService from "../../../services/storage";
import Constants from "../../../config/Constant";
import {cancelablePromise} from "../../../utils/promise";
import storeService from "../../../services/StoreService";
import {CredentialUtils} from "../../../utils/credential";
import {ImageUtils} from "../../../utils/image";
import {connect} from "react-redux";
import store from "../../../config/redux/ReduxStore";
import {AgencyService} from "../../../services/AgencyService";
import GSImg from "../GSImg/GSImg";

class StoreFrontInfo extends Component {

    render() {
        const storeInfo = {
            name: CredentialUtils.getStoreName(),
                url: CredentialUtils.getStoreUrl(),
                image: CredentialUtils.getStoreImage()
        }

        const {className, ...other} = this.props
        return (
            <>
                {storeInfo.name &&
                <div className={["store-front-info", className].join(' ')} {...other}>
                    <div className="store-icon">
                        <a href={`https://${storeInfo.url}.${AgencyService.getStorefrontDomain()}`} target="_blank">
                            {
                                storeInfo.image
                                    ? <GSImg src={ImageUtils.resizeImage(storeInfo.image, 50)}/>
                                    : <GSImg src="/assets/images/home.svg"/>
                            }
                        </a>
                    </div>
                    <div className="store-detail d-mobile-none d-tablet-none d-desktop-exclude-tablet-flex">
                    <span className="store-detail__name">
                        {storeInfo.name}
                    </span>
                        <span className="store-detail__url" data-sherpherd="tour-guide-store-front-url">
                        <a href={`https://${storeInfo.url}.${AgencyService.getStorefrontDomain()}`}
                           target="_blank">{storeInfo.url}.{AgencyService.getStorefrontDomain()}</a>
                    </span>
                    </div>
                </div>}
            </>
        );
    }

    componentDidMount() {
        // const pmGetStoreInfo = storeService.getStoreInfo(CredentialUtils.getStoreId())
        // const pmGetStoreLogos = storeService.getLogos()

        // this.pmFectchData = cancelablePromise(Promise.all([pmGetStoreInfo, pmGetStoreLogos]))
        // this.pmFectchData.promise
        //     .then( results => {
        //         const storeInfo  = results[0]
        //         const storeLogo = results[1]
        //
        //         this.setState({
        //             storeName: storeInfo.name,
        //             storeUrl: storeInfo.url,
        //             storeImage: storeLogo.shopLogo && storeLogo.shopLogo.urlPrefix? ImageUtils.getImageFromImageModel(storeLogo.shopLogo, 100):''
        //         })
        //     }).catch(e => {})
    }

    componentWillUnmount() {
        // if (this.pmFectchData) this.pmFectchData.cancel()
    }
}


export default StoreFrontInfo;
