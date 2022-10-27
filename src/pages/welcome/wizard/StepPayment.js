import React, {Component} from 'react';
import PackageRegister from "../../../components/shared/PackageRegister/PackageRegister";
import WizardLayout from "./layout/WizardLayout";
import {Link} from "react-router-dom";
import {NAV_PATH} from "../../../components/layout/navigation/Navigation";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faSignOutAlt} from "@fortawesome/free-solid-svg-icons";
import GSTrans from "../../../components/shared/GSTrans/GSTrans";
import {connect} from "react-redux";
import beehiveService from "../../../services/BeehiveService";
import Constants from "../../../config/Constant";
import {RouteUtils} from "../../../utils/route";
import storeService from "../../../services/StoreService";
import {CredentialUtils} from "../../../utils/credential";
import {ImageUtils} from "../../../utils/image";

class StepPayment extends Component {

    async componentDidMount() {
        CredentialUtils.setIsWizard(true)
        // storageService.setItem(Constants.STORAGE_KEY_USER_ID, 6880)
        // CredentialUtils.setLangKey('vi')
        const currentPlan = await beehiveService.getCurrentPlan()

        if (currentPlan.userFeature.packagePay === Constants.PackageType.PAID) { // PAID

            const storeRes = await storeService.getStoreInfo(CredentialUtils.getStoreId())
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

            CredentialUtils.setIsWizard(false)

            RouteUtils.linkTo(this.props, NAV_PATH.home)

        }
    }


    render() {
        return (
            <WizardLayout>
                <PackageRegister atPage={PackageRegister.PAGE.WIZARD} defaultExp={this.props.expId} defaultPkg={this.props.pkgId}/>
                <div className="pt-3" style={{
                    textAlign: 'center'
                }}>
                    <Link to={NAV_PATH.logout}>
                        <FontAwesomeIcon icon={faSignOutAlt}/>
                        <span className="ml-1">
                                <GSTrans t="component.logout.label.logout"/>
                            </span>
                    </Link>
                </div>
            </WizardLayout>
        );
    }
}

StepPayment.propTypes = {};

const mapRegisterInfo = (state) => {
    return {
        store: state.registerInfo.store,
        warnings: state.registerInfo.warnings,
        pkgId: state.registerInfo.pkgId,
        expId: state.registerInfo.expId
    }
};

export default connect(mapRegisterInfo)(StepPayment);
