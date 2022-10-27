import React, {useEffect, useState} from 'react';
import GSContentContainer from "../../../components/layout/contentContainer/GSContentContainer";
import GSContentHeaderTitleWithExtraTag
    from "../../../components/layout/contentHeader/HeaderExtraTag/GSContentHeaderTitleWithExtraTag";
import i18next from "i18next";
import GSContentHeaderRightEl
    from "../../../components/layout/contentHeader/ContentHeaderRightEl/GSContentHeaderRightEl";
import GSButton from "../../../components/shared/GSButton/GSButton";
import GSTrans from "../../../components/shared/GSTrans/GSTrans";
import GSContentHeader from "../../../components/layout/contentHeader/GSContentHeader";
import {GSLayoutCol10, GSLayoutCol2, GSLayoutRow} from "../../../components/layout/GSLayout/GSLayout";
import {Trans} from "react-i18next";
import {UikToggle, UikWidget, UikWidgetContent, UikWidgetHeader} from "../../../@uik";
import GSContentBody from "../../../components/layout/contentBody/GSContentBody";
import {AvForm, AvRadio, AvRadioGroup} from "availity-reactstrap-validation";
import './ShopeeSettings.sass';
import _ from 'lodash';
import shopeeService from '../../../services/ShopeeService';
import {RouteUtils} from '../../../utils/route';
import {NAV_PATH} from '../../../components/layout/navigation/Navigation';
import {GSToast} from '../../../utils/gs-toast';
import {AgencyService} from "../../../services/AgencyService";


const shopeeSettings = props => {

    const SYNC = {
        true: "AUTO_SYNC_STOCK_ON",
        false: "AUTO_SYNC_STOCK_OFF"
    }

    const [stAutoNotification,setStAutoNotification]=useState(true)
    const [stAutoSyncStock, setStAutoSyncStock] = useState(SYNC.true)
    const [stSetting, setStSetting] = useState(null);

    useEffect(() => {
        checkShopeeAccount();
        return () => {};
    }, [])

    useEffect(() => {
        loadShopeeSetting();
        return () => {};
    }, [])

    const saveSettings = () => {
        shopeeService.saveShopeeSetting(stSetting)
        .then((resp) => {
            setStSetting(resp);
            GSToast.commonUpdate();
        })
        .catch(() => GSToast.commonError())
    }

    const onChangeAutoSync = (e) => {
        if(!e.target) return;
        const {value, checked} = e.target;
        let isAutoSync = true;
        if(value === SYNC[false]) {
            isAutoSync = false;
        }
        setStAutoSyncStock(value);
        setStSetting({
            ...stSetting,
            settingObject: {
                autoSynStock: isAutoSync,
                autoNotification: stAutoNotification
            }
        })
    }

    const checkShopeeAccount = () => {
        shopeeService.getAllShopeeAccount()
            .then(response => {
                if(_.isEmpty(response)) {
                    RouteUtils.redirectWithoutReload(props, NAV_PATH.shopeeAccountIntro);
                }
            })
    }

    const loadShopeeSetting = () => {
        shopeeService.loadShopeeSetting()
        .then((resp) => {
            setStSetting(resp);
            const isAutoSync = resp.settingObject.autoSynStock;
            const isAutoNoti=resp.settingObject.autoNotification;
            setStAutoSyncStock(SYNC[isAutoSync]);
            setStAutoNotification(isAutoNoti);
        })
        .catch(() => GSToast.commonError())
    }


    const renderRadioBoxSettings = () => {
        return (
            <AvForm className="settingsShopeeForm">
                <AvRadioGroup
                    className="settingsShopeeRadio"
                    onChange={onChangeAutoSync}
                    name="settingsShopee"
                    value={stAutoSyncStock}
                >
                    <>
                        <AvRadio
                            customInput
                            value={"AUTO_SYNC_STOCK_OFF"}
                            label={i18next.t("page.shopee.settings.description2", {provider: AgencyService.getDashboardName()})}
                        />
                        <AvRadio
                            customInput
                            value={"AUTO_SYNC_STOCK_ON"}
                            label={i18next.t("page.shopee.settings.description3", {provider: AgencyService.getDashboardName()})}
                        />

                    </>
                </AvRadioGroup>
            </AvForm>
        );
    }
    const onChangeNotification=(e)=>{
        let autoSync=true;
        if(stAutoSyncStock==SYNC.true){
            autoSync=true
        }
        else{
            autoSync=false
        }
        setStAutoNotification(e.target.checked)
        setStSetting({
            ...stSetting,
            settingObject: {
                autoSynStock: autoSync,
                autoNotification: e.target.checked
            }
        })
    }
    return (
        <>
            <GSContentContainer className="shopeeSettings">
                <GSContentHeader
                    title={
                        <GSContentHeaderTitleWithExtraTag title={i18next.t("page.shopee.settings.title")}/>
                    }
                    style={{
                        paddingBottom: "1em"
                    }}>
                    <GSContentHeaderRightEl className="d-flex">
                        <GSButton
                            success
                            onClick={saveSettings}>
                            <GSTrans t={"page.shopee.settings.save"}/>
                        </GSButton>
                    </GSContentHeaderRightEl>
                </GSContentHeader>
            <GSContentBody>
                <GSLayoutRow>
                    <GSLayoutCol2 className={'p-0 font-weight-bold'}>
                        <Trans i18nKey="page.shopee.settings.title2"></Trans>
                    </GSLayoutCol2>
                    <GSLayoutCol10 className={'p-0'}>
                        <UikWidget className="gs-widget m-0">
                            <UikWidgetHeader className="gs-widget__header">
                                <Trans i18nKey="page.shopee.settings.title3" values={{provider: AgencyService.getDashboardName()}}>

                                </Trans>
                            </UikWidgetHeader>
                            <UikWidgetContent
                                className="gs-widget__content body pl-5">
                                <div className="shopee-description">
                                    <Trans i18nKey="page.shopee.settings.description" values={{provider: AgencyService.getDashboardName()}}>
                                        Choose an action when the inventory of a particular product on <b>GoSELL</b> or <b>Shopee</b> changes
                                    </Trans>
                                </div>
                                {renderRadioBoxSettings()}

                            </UikWidgetContent>
                        </UikWidget>
                    </GSLayoutCol10>
                </GSLayoutRow>
                <br/>
                <GSLayoutRow className="shopee-notification">
                    <GSLayoutCol2 className={'p-0 font-weight-bold'}>
                        <Trans i18nKey="page.shopee.settings.notification"></Trans>
                    </GSLayoutCol2>
                    <GSLayoutCol10 className="bg-white">
                        <div className="d-flex center-description">
                            <Trans i18nKey="page.shopee.settings.notificationDescription">
                            </Trans>
                                <UikToggle
                                    checked={stAutoNotification}
                                    onChange={(e)=>onChangeNotification(e)}
                                    className="checkout-information__toggle"
                                />

                        </div>
                    </GSLayoutCol10>
                </GSLayoutRow>
            </GSContentBody>
            </GSContentContainer>
        </>
    );
}


export default shopeeSettings;
