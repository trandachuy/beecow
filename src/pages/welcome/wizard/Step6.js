import React, {Component} from 'react';
import {destroySetRegisterInfo} from "../../../config/redux/Reducers";
import {connect} from "react-redux";
import {Trans} from "react-i18next";
import {Link} from "react-router-dom";
import PropTypes from "prop-types";

import './Step6.sass'
import {NAV_PATH} from "../../../components/layout/navigation/Navigation";
import StoreModel from "../../../components/shared/model/StoreModel";
import storageService from '../../../services/storage';
import Constants from '../../../config/Constant';
import {UikButton} from '../../../@uik';
import storeService from "../../../services/StoreService";
import beehiveService from "../../../services/BeehiveService";
import {CredentialUtils} from "../../../utils/credential";
import {ImageUtils} from "../../../utils/image";

class Step6 extends Component {

    constructor(props) {
        super(props);
        if (!this.props.store) {
            // Not have store (load from redux context), mean navigate direct to this page
            // So redirect back to step 1
            window.location.href = NAV_PATH.wizard + '/1';
        }

        this.store = this.props.store;

        // set storeId
        storageService.setToLocalStorage(Constants.STORAGE_KEY_STORE_ID, this.store.id);

        // save userId to storage again
        storageService.setToLocalStorage(Constants.STORAGE_KEY_USER_ID, this.store.ownerId);

        // set full store
        storageService.setToLocalStorage(Constants.STORAGE_KEY_STORE_FULL, Constants.STORAGE_KEY_STORE_FULL);



        // destroy redux
        this.props.dispatch(destroySetRegisterInfo());
    }

    async componentDidMount() {
        // get data in first time
        const storeRes = await storeService.getStoreInfo(this.props.store.id)
        const storeLogoRes = await storeService.getLogos()
        const role = await beehiveService.getCurrentPlan()

        CredentialUtils.setPackageName(role.packageName)
        CredentialUtils.setExpiredTimeInMS(role.userFeature.expiredPackageDate)
        CredentialUtils.setRegTime(role.userFeature.registerPackageDate)
        CredentialUtils.setPackageType(role.userFeature.packagePay)
        CredentialUtils.setPackageId(role.userFeature.packageId)


        CredentialUtils.setStoreName(storeRes.name)
        CredentialUtils.setStoreUrl(storeRes.url)
        CredentialUtils.setStoreImage(ImageUtils.getImageFromImageModel(storeLogoRes.shopLogo))
    }

    render() {
        return (
            <div className="step6-page__wrapper">
                <div className="step-page__container">
                    <img 
                        src={require('../../../../public/assets/images/startup.svg')}
                        // width="50%"
                        // height="50%"
                    />
                    <div className="congratulation">
                        <Trans i18nKey="welcome.wizard.step6.title">
                            Congratulation
                        </Trans>
                    </div>
                    <div className="suggest">
                        <Trans i18nKey="welcome.wizard.step6.suggest">
                            Your store is being prepared. It's going to be gorgeous! In few minutes, you'll have your very own, professional web store.
                        </Trans>
                    </div>
                    <UikButton success Component={Link} to={NAV_PATH.home}>
                        <Trans i18nKey={'welcome.wizard.step6.btn'}/>
                    </UikButton>
                </div>
            </div>
        );
    }
}

const mapRegisterInfo = (state) => {
    return {
        store: state.registerInfo.store
    }
};

export default connect(mapRegisterInfo)(Step6);

Step6.propTypes = {
    store: PropTypes.instanceOf(StoreModel)
};

