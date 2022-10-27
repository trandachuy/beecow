import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import PropTypes from 'prop-types';
import GSWidget from "../../../../components/shared/form/GSWidget/GSWidget";
import GSWidgetHeader from "../../../../components/shared/form/GSWidget/GSWidgetHeader";
import GSWidgetContent from "../../../../components/shared/form/GSWidget/GSWidgetContent";
import GSWidgetFooter from "../../../../components/shared/form/GSWidget/GSWidgetFooter";
import {SHIPPING_AND_PAYMENT_PAGE} from "../../ShippingAndPayment/ShippingAndPayment";
import GSFakeLink from "../../../../components/shared/GSFakeLink/GSFakeLink";
import GSTrans from "../../../../components/shared/GSTrans/GSTrans";
import GSButton from "../../../../components/shared/GSButton/GSButton";
import GSWidgetEmptyContent from "../../../../components/shared/GSWidgetEmptyContent/GSWidgetEmptyContent";
import i18next from "i18next";
import styled from 'styled-components'
import storeService from "../../../../services/StoreService";
import {useLoading} from "../../../../utils/hooks/useLoading";
import Loading, {LoadingStyle} from "../../../../components/shared/Loading/Loading";
import {useRecoilState} from "recoil";
import {SelfDeliveryConfigurationRecoil} from "./recoil/SelfDeliveryConfigurationRecoil";
import SelfDeliveryConfigLocation from "./ShippingLocation/SelfDeliveryConfigLocation";
import catalogService from "../../../../services/CatalogService";
import ShippingLocationEditorModal from "./ShippingLocationEditorModal/ShippingLocationEditorModal";
import {CredentialUtils} from "../../../../utils/credential";
import Constants from "../../../../config/Constant";
import {StringUtils} from "../../../../utils/string";
import AlertModal from "../../../../components/shared/AlertModal/AlertModal";
import ConfirmModal from "../../../../components/shared/ConfirmModal/ConfirmModal";
import ShippingRuleEditorModal from "./ShippingRuleEditorModal/ShippingRuleEditorModal";
import _ from "lodash";
import {useSaving} from "../../../../utils/hooks/useSaving";
import LoadingScreen from "../../../../components/shared/LoadingScreen/LoadingScreen";
import {GSToast} from "../../../../utils/gs-toast";
import i18n from "i18next";
import {OrderInStorePurchaseContext} from "../../../order/instorePurchase/context/OrderInStorePurchaseContext";

const WarnBox = styled.div`
  background: #FFF2DB;
  border: 1px solid #FBAD29;
  border-radius: 3px;
  padding: 10px 8px;
  margin-top: auto;
`

const SelfDeliveryConfiguration = props => {
    const refInitValue = useRef([]);
    const [stShippingLocationList, setShippingLocationList] = useRecoilState(SelfDeliveryConfigurationRecoil.shippingLocationListState);
    const [stCountryList, setCountryList] = useRecoilState(SelfDeliveryConfigurationRecoil.countryListState);
    const [stCountryMap, setCountryMap] = useRecoilState(SelfDeliveryConfigurationRecoil.countryMapState);
    const [isLoading, startLoading, stopLoading] = useLoading(true)
    const [isSaving, startSaving, stopSaving] = useSaving(false)
    const [stIsShowLocationEditorModal, setStIsShowLocationEditorModal] = useState(false);
    const [stLocationEditorMode, setLocationEditorMode] = useState(ShippingLocationEditorModal.EDITOR_MODE.ADD);
    const [stCurrentEditLocation, setStCurrentEditLocation] = useState(null);
    const refConfirmModal = useRef(null);

    // RULE
    const [stIsShowRuleEditorModal, setStIsShowRuleEditorModal] = useState(false);
    const [stRuleEditorMode, setStRuleEditorMode] = useState(ShippingRuleEditorModal.MODE.ADD);
    const [stCurrentEditRule, setStCurrentEditRule] = useState(null);


    useEffect(() => {

        const countriesPromise = catalogService.getCountries({
            withCities: true
        })
        const selfDeliveryPromise = storeService.getSelfDeliveryShippingLocation(true)

        Promise.all([selfDeliveryPromise, countriesPromise])
            .then( ([locationList, countryList]) => {
                setShippingLocationList(locationList)
                refInitValue.current = locationList

                let countryMap = {}
                countryList.forEach(country => {
                    countryMap[country.code] = country
                })
                setCountryMap(countryMap)
            }).finally(() => {
                stopLoading()
            })
    }, []);


    const onClickSave = () => {
        /**
         * @type {SelfDeliveryProviderUpdateVM}
         */
        const request = {
            storeId: CredentialUtils.getStoreId(),
            deliveryList: stShippingLocationList
        }
        // console.log(request)
        startSaving()
        storeService.updateSelfDeliveryLocation(request)
            .then(() => {
                GSToast.commonUpdate()
                refInitValue.current = stShippingLocationList
            })
            .catch(() => {
                GSToast.commonError()
            })
            .finally(() => {
                stopSaving()
            })
    }

    const onChangePage = () => {

        if (!_.isEqual(refInitValue.current, stShippingLocationList)) {
            refConfirmModal.current.openModal({
                messages: i18n.t('component.product.addNew.cancelHint'),
                okCallback: () => {
                    props.onChangePage(SHIPPING_AND_PAYMENT_PAGE.ROOT)
                }
            })
        } else {
            props.onChangePage(SHIPPING_AND_PAYMENT_PAGE.ROOT)
        }
    }

    const onClickAddNew = () => {
        setStIsShowLocationEditorModal(true)
        setLocationEditorMode(ShippingLocationEditorModal.EDITOR_MODE.ADD)
    }

    const onCloseLocationEditorModal = () => {
        setStIsShowLocationEditorModal(false)
    }

    const onDoneLocationEditorModal = ({index, mode, cities, countries}) => {
        if (mode === ShippingLocationEditorModal.EDITOR_MODE.ADD) {
            let enabled = true
            if (stShippingLocationList.length > 0) {
                enabled = stShippingLocationList[0].enabled
            } else {
                enabled = false
            }

            /**
             * @type {SelfDeliverySettingVM}
             */
            let location = {
                allowedLocations: cities,
                allowedCountryCodeList: countries,
                storeId: CredentialUtils.getStoreId(),
                shippingRuleList: [],
                providerName: Constants.LogisticCode.Common.SELF_DELIVERY,
                enabled: enabled,
                allowedLocationCodes: cities.join(',')
            }

            setShippingLocationList([location, ...stShippingLocationList])
        } else {
            let locationList = _.cloneDeep(stShippingLocationList)
            locationList[index].allowedLocations = cities
            locationList[index].allowedCountryCodeList = countries
            locationList[index].allowedLocationCodes = cities.join(',')
            setShippingLocationList(locationList)
        }
        setStIsShowLocationEditorModal(false)
    }

    const getSelectedCountryCodeList = useCallback(() => {
        let ignoreCityCodeList = [...new Set(getSelectedCityCodeList().map(c => c.substr(0, 2)))]
        return ignoreCityCodeList
    }, [stShippingLocationList, stLocationEditorMode, stCurrentEditLocation])

    const getSelectedCityCodeList = useCallback(() => {
        let result = []
        let selectAnyCityList = new Set()
        stShippingLocationList.forEach(
            /**
             * @param {SelfDeliverySettingVM} location
             */
            location => {
            location.allowedLocations.forEach(code => {
                if (code.length === 2) {
                    result.push(code)
                } else {
                    selectAnyCityList.add(code)
                }
            })
        })
        selectAnyCityList = [...selectAnyCityList]

        // remove edit case
        if (stLocationEditorMode === ShippingLocationEditorModal.EDITOR_MODE.EDIT && stCurrentEditLocation) {
            selectAnyCityList = selectAnyCityList.filter(r => !stCurrentEditLocation.location.allowedLocations.includes(r))
            result = result.filter(r => !stCurrentEditLocation.location.allowedLocations.includes(r))
        }

        let cityCount = {}
        selectAnyCityList.forEach(cityCode => {
            const countryCode = cityCode.substr(0, 2)
            cityCount[countryCode] = (cityCount[countryCode] || 0) + 1
        })

        Object.entries(cityCount).forEach(([code, count]) => {
            if (stCountryMap[code].cities.length === count) {
                result.push(code)
            } else {
                result.push(...selectAnyCityList.filter(c => c.substr(0, 2) === code))
            }
        })

        return result
    }, [stShippingLocationList, stLocationEditorMode, stCurrentEditLocation])

    const onRemoveLocation = (index) => {
        refConfirmModal.current.openModal({
            messages: i18next.t('page.setting.shippingAndPayment.location.deleteHint'),
            okCallback: () => {
                let locationList = [...stShippingLocationList]
                locationList.splice(index, 1)
                setShippingLocationList(locationList)
            }
        })
    }

    const onEditLocation = (index) => {
        setStCurrentEditLocation(
            {
                index,
                location: stShippingLocationList[index]
            }
        )
        setLocationEditorMode(ShippingLocationEditorModal.EDITOR_MODE.EDIT)
        setStIsShowLocationEditorModal(true)
    }

    const onAddRule = (locationIndex) => {
        setStRuleEditorMode(ShippingRuleEditorModal.MODE.ADD)
        setStIsShowRuleEditorModal(true)
        setStCurrentEditRule({
            locationIndex: locationIndex,
            validCondition: stShippingLocationList[locationIndex].shippingRuleList[0]?.condition
        })
    }

    const onEditRule = (locationIndex, ruleIndex) => {
        setStRuleEditorMode(ShippingRuleEditorModal.MODE.EDIT)
        setStIsShowRuleEditorModal(true)
        setStCurrentEditRule({
            locationIndex: locationIndex,
            validCondition: stShippingLocationList[locationIndex].shippingRuleList.length > 1 &&
                stShippingLocationList[locationIndex].shippingRuleList[0]?.condition,
            rule: stShippingLocationList[locationIndex].shippingRuleList[ruleIndex],
            ruleIndex: ruleIndex
        })
    }

    const onRemoveRule = (locationIndex, ruleIndex) => {
        refConfirmModal.current.openModal({
            messages: i18next.t('page.setting.shippingAndPayment.rule.deleteWarn'),
            okCallback: () => {
                let locationList = _.cloneDeep(stShippingLocationList)
                locationList[locationIndex].shippingRuleList.splice(ruleIndex, 1)
                setShippingLocationList(locationList)
            }
        })
    }

    const onCloseRuleEditorModal = () => {
        setStIsShowRuleEditorModal(false)
    }

    const onDoneRuleEditorModal = ({locationIndex, mode, rule, ruleIndex}) => {
        if (mode === ShippingRuleEditorModal.MODE.ADD) {
            let locationList = _.cloneDeep(stShippingLocationList)
            locationList[locationIndex].shippingRuleList = [rule, ...locationList[locationIndex].shippingRuleList]
            setShippingLocationList(locationList)
        } else {
            let locationList = _.cloneDeep(stShippingLocationList)
            locationList[locationIndex].shippingRuleList[ruleIndex] = rule
            setShippingLocationList(locationList)
        }

        setStIsShowRuleEditorModal(false)
    }

    return (
        <>
            {isSaving && <LoadingScreen loadingStyle={LoadingStyle.ELLIPSIS}/>}
            <ConfirmModal ref={refConfirmModal}/>
            <ShippingRuleEditorModal
                isOpen={stIsShowRuleEditorModal}
                mode={stRuleEditorMode}
                onClose={onCloseRuleEditorModal}
                onDone={onDoneRuleEditorModal}
                locationList={stShippingLocationList}
                editRule={stCurrentEditRule}
            />
            <ShippingLocationEditorModal
                isOpen={stIsShowLocationEditorModal}
                mode={stLocationEditorMode}
                onClose={onCloseLocationEditorModal}
                onDone={onDoneLocationEditorModal}
                ignoreCityCodeList={getSelectedCityCodeList()}
                ignoreCountryCodeList={getSelectedCountryCodeList()}
                editLocation={stCurrentEditLocation}
            />
            <GSWidget className="gs-ani__fade-in">
                <GSWidgetHeader className="flex-column flex-md-row align-items-start align-items-md-center" rightEl={
                    <div className="d-flex mt-2 mt-md-0">
                        <GSButton success outline onClick={onClickAddNew}>
                            <GSTrans t="page.setting.shippingAndPayment.btnAddShippingLocation"/>
                        </GSButton>
                        <GSButton success marginLeft onClick={onClickSave}>
                            <GSTrans t="common.btn.save"/>
                        </GSButton>
                    </div>
                }>
                    <GSFakeLink onClick={onChangePage} className="color-gray mb-2 d-block gsa-hover--fadeOut cursor--pointer font-weight-normal font-size-14px">
                        &#8592; <GSTrans t="page.setting.shippingAndPayment.backToProviderSetting"/>
                    </GSFakeLink>


                </GSWidgetHeader>
                <GSWidgetContent style={{
                    minHeight: '50vh'
                }}
                className="d-flex flex-column">
                    {!isLoading && stShippingLocationList.length === 0 &&
                        <>
                            <GSWidgetEmptyContent iconSrc="/assets/images/empty-shipping-location.png"
                                                  text={i18next.t('page.setting.shipping.selfDelivery.hasNoLocation')}
                                                  style={{
                                                      backgroundColor: 'white',
                                                      flexGrow: 1
                                                  }}
                            />

                        </>
                    }
                    {isLoading &&
                        <div className="flex-grow-1 d-flex justify-content-center align-items-center">
                            <Loading style={LoadingStyle.DUAL_RING_GREY}/>
                        </div>
                    }

                    {/*SHIPPING LOCATION LIST*/}

                    {stShippingLocationList.map((location, index) => (
                            <SelfDeliveryConfigLocation data={location}
                                                        key={StringUtils.hashCode(location.allowedLocationCodes)}
                                                        index={index}
                                                        onRemove={onRemoveLocation}
                                                        onEdit={onEditLocation}
                                                        onAddRule={onAddRule}
                                                        onEditRule={onEditRule}
                                                        onRemoveRule={onRemoveRule}
                            />
                    ))
                    }

                    <WarnBox>
                        <GSTrans t="page.setting.shippingAndPayment.emptyWarn">
                            <strong>Notice: </strong>Orders will be considered
                        </GSTrans>
                    </WarnBox>
                </GSWidgetContent>
            </GSWidget>
        </>
    );
};

SelfDeliveryConfiguration.propTypes = {
    onChangePage: PropTypes.func,
    currency: PropTypes.string,
};

export default SelfDeliveryConfiguration;
