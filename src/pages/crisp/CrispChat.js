import React, {useEffect} from 'react';
import Crisp from 'react-crisp';
import {CredentialUtils} from "../../utils/credential";
import {TokenUtils} from "../../utils/token";
import './CrispChat.sass';
import {AgencyService} from "../../services/AgencyService";
import moment from "moment";
import beehiveService from "../../services/BeehiveService";

const CrispChat = () => {

    useEffect(() => {
        getDataPeopleCrisp();
    }, [])

    const formatPackageTypes = (currentPlans) => {
        let packageTypes = '';

        currentPlans.forEach((plan) => {
            packageTypes = packageTypes.concat(plan.packageName === 'GoOMNI' ? 'GoFREE' : plan.packageName)
                .concat(`, sd: ${moment.unix(plan.userFeature.registerPackageDate).format('DD/MM/YYYY')}`)
                .concat(`, ed: ${moment.unix(plan.userFeature.expiredPackageDate).format('DD/MM/YYYY')}\n`);
        });

        return packageTypes;
    }

    const getDataPeopleCrisp = () =>{
        const currentPlans = CredentialUtils.getCurrentPlans(),
            Crisp = (plans) => {
                window.$crisp.push(["set", "session:data", [[["user_id", CredentialUtils.getStoreId()],
                    ["domain", `${CredentialUtils.getStoreUrl()}.${AgencyService.getStorefrontDomain()}`],
                    ["address", CredentialUtils.getStoreAddress()],
                    ["package_type", formatPackageTypes(plans)],
                    ["store_name", CredentialUtils.getStoreName()],
                    ["phone", CredentialUtils.getStorePhone()],
                ]]])
            }
        if (currentPlans) {
            Crisp(currentPlans);
        }  else {
            beehiveService.getCurrentPlanList()
                .then((plans) => {
                    CredentialUtils.setCurrentPlans(plans)
                    Crisp(plans);
                });
        }

    }

    return (
        <div style={{display: 'none'}}>
            <Crisp
                crispWebsiteId={process.env.CRISP_WEBSITEID} // Required
                crispTokenId={`crisp_${CredentialUtils.getStoreId()}`}
                attributes={{
                    "user:email": [CredentialUtils.getStoreEmail()],
                    "user:nickname": [TokenUtils.getDisplayName()],
                    "user:phone": [CredentialUtils.getStorePhone()],
                    "user:avatar": CredentialUtils.getStoreImage() ? [CredentialUtils.getStoreImage()] : ['https://dm4fv4ltmsvz0.cloudfront.net/storefront-images/go-chat-default-avatar.png']

                }}

            />
        </div>
    );
};

export default CrispChat;