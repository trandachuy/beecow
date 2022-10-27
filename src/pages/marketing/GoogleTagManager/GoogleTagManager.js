import React, {useEffect, useState} from 'react';
import GSContentContainer from "../../../components/layout/contentContainer/GSContentContainer";
import GSWidget from "../../../components/shared/form/GSWidget/GSWidget";
import GSWidgetContent from "../../../components/shared/form/GSWidget/GSWidgetContent";
import {Trans} from "react-i18next";
import GSWidgetHeader from "../../../components/shared/form/GSWidget/GSWidgetHeader";
import './GoogleTagManager.sass';
import GSButton from "../../../components/shared/GSButton/GSButton";
import GSContentHeader from "../../../components/layout/contentHeader/GSContentHeader";
import GSTrans from "../../../components/shared/GSTrans/GSTrans";
import GSContentHeaderRightEl
    from "../../../components/layout/contentHeader/ContentHeaderRightEl/GSContentHeaderRightEl";
import {PACKAGE_FEATURE_CODES} from "../../../config/package-features";
import {AvField, AvForm} from "availity-reactstrap-validation";
import PrivateComponent from "../../../components/shared/PrivateComponent/PrivateComponent";
import i18next from "i18next";
import storeService from "../../../services/StoreService";
import {GSToast} from "../../../utils/gs-toast";
import {CredentialUtils} from "../../../utils/credential";

const GoogleTagManager = props => {
    const [stTagId, setStTagId] = useState();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(()=>{
        getGoogleTagManager();
    },[])

    const getGoogleTagManager = () => {
        storeService.getAllGoogleTagManager()
            .then((result) => {
                setStTagId(result)
            })
            .catch(() => {})
    }

    const handleSaveTagManager = (event, errors, values) => {
        if(stTagId){
            const dataRequest = {
                id : stTagId.id,
                storeId: CredentialUtils.getStoreId(),
                description: values.note
            }
            storeService.updateGoogleTagManager(dataRequest)
            .then(() => GSToast.commonUpdate())
            .catch(() => GSToast.commonError())
        }else {
            const dataCreate = {
                storeId: CredentialUtils.getStoreId(),
                description: values.note
            }


            storeService.createGoogleTagManager(dataCreate)
            .then((result) => {
                setStTagId(result)
                GSToast.commonCreate()
            })
            .catch(() => GSToast.commonError())
        }

    }

    return (
        <>
            <GSContentContainer className="GoogleTagManager">
                <GSContentHeader
                    title={<GSTrans t={"page.marketing.googleTagManager.title"} />}
                >
                    <GSContentHeaderRightEl>
                        <PrivateComponent hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.WEB_PACKAGE]}
                                          wrapperDisplay={"block"}
                        >
                            <GSButton success onClick={() => this.refBtnSubmitForm.click()}>
                                <GSTrans t="common.btn.save" />
                            </GSButton>
                        </PrivateComponent>
                    </GSContentHeaderRightEl>
                </GSContentHeader>
                <GSWidget>
                    <GSWidgetHeader className="gs-widget__header">
                        <section className="preference-content-title title-customize">
                            <h3><Trans i18nKey="page.marketing.googleTagManager.title">Install Google Tag Manager</Trans></h3>
                            <div style={{color: "#9EA0A5"}}>
                                <Trans i18nKey="page.marketing.googleTagManager.description">
                                </Trans>
                            </div>
                        </section>
                    </GSWidgetHeader>
                    <GSWidgetContent className="preference-content-detail">
                        <AvForm onSubmit={(event, error, values) => handleSaveTagManager(event, error, values)}>
                            <button type="submit" ref={(el) => this.refBtnSubmitForm = el} hidden/>
                            <PrivateComponent hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.WEB_PACKAGE]}
                                              wrapperDisplay={"block"}
                            >
                                <AvField
                                    label={i18next.t("page.marketing.googleTagManager.note")}
                                    name={"note"}
                                    value={ stTagId ? stTagId.description : ''}
                                />
                            </PrivateComponent>
                        </AvForm>
                    </GSWidgetContent>
                </GSWidget>
            </GSContentContainer>
        </>
    );
}


export default GoogleTagManager;
