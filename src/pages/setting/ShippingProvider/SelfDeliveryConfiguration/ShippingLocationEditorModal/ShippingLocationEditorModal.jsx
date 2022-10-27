/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 10/11/2021
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import PropTypes from 'prop-types';
import {Modal, ModalBody, ModalFooter, ModalHeader} from "reactstrap";
import GSButton from "../../../../../components/shared/GSButton/GSButton";
import GSTrans from "../../../../../components/shared/GSTrans/GSTrans";
import GSSearchInput from "../../../../../components/shared/GSSearchInput/GSSearchInput";
import i18next from "../../../../../config/i18n";
import {UikCheckbox} from "../../../../../@uik";
import {useRecoilState} from "recoil";
import {SelfDeliveryConfigurationRecoil} from "../recoil/SelfDeliveryConfigurationRecoil";
import * as Styled from './ShippingLocationEditorModal.styled'


const ShippingLocationEditorModal = props => {

    const [stIsSelectedAll, setStIsSelectedAll] = useState(false);
    const [stCountryMap, setCountryMap] = useRecoilState(SelfDeliveryConfigurationRecoil.countryMapState);
    const [stKeyword, setStKeyword] = useState('');
    const [stCityList, setStCityList] = useState([]);
    const [stCurrentCountryCode, setCurrentCountryCode] = useState(null);

    const [stSelectedCityList, setStSelectedCityList] = useState([]);
    const [stSelectedCountryList, setStSelectedCountryList] = useState([]);

    useEffect(() => {
        if (props.isOpen) {
            if (props.mode === ShippingLocationEditorModal.EDITOR_MODE.EDIT) {
                const index  = props.editLocation.index
                /**
                 * @type {SelfDeliverySettingVM}
                 */
                const location = props.editLocation.location

                setStSelectedCityList(location.allowedLocations)
                setStSelectedCountryList(location.allowedCountryCodeList)

            }
        } else {
            reset()
        }

    }, [props.isOpen, props.mode]);


    useEffect(() => {
        if (stSelectedCountryList.length === Object.keys(stCountryMap).length && stSelectedCountryList.length > 0) {
            setStIsSelectedAll(true)
        } else {
            setStIsSelectedAll(false)
        }
    }, [stSelectedCountryList, stCountryMap]);


    const reset = () => {
        setStIsSelectedAll(false)
        setStKeyword('')
        setStCityList([])
        setCurrentCountryCode(null)
        setStSelectedCityList([])
        setStSelectedCountryList([])
    }

    const onDone = () => {
        // combine with ignore list
        // ignore country first
        let remainingCities = stSelectedCityList.filter(c => !props.ignoreCityCodeList.includes(c))
        let remainingCountries = new Set()
        remainingCities.forEach(c => {
            if (c.length === 2) {
                remainingCountries.add(c)
            } else {
                remainingCountries.add(c.substr(0, 2))
            }
        })


        let ignoreCountryCodeList = props.ignoreCountryCodeList

        remainingCountries = [...remainingCountries]
        remainingCountries.forEach(rCode => {
            if (ignoreCountryCodeList.includes(rCode)) { // include in ignore list
                if (remainingCities.includes(rCode)) { // this country select all city -> convert to each city that exclude ignore list
                    remainingCities = remainingCities.filter(cCode => cCode !== rCode) // remove all key
                    remainingCities.push(
                        ...stCountryMap[rCode].cities.map(c => c.code).filter(cCode => !props.ignoreCityCodeList.includes(cCode))
                    )
                }
            }
        })


        props.onDone({
            index: props.editLocation?.index,
            mode: props.mode,
            cities: remainingCities,
            countries: [...remainingCountries]
        })
    }

    const onClose = () => {
        props.onClose()
    }

    const onSearch = (keyword) => {
        setCurrentCountryCode(null)
        setStCityList([])
        setStKeyword(keyword)
    }

    const canDone = useCallback(() => {
        return stSelectedCityList.length === 0 && stSelectedCountryList.length === 0
    }, [stSelectedCityList, stSelectedCountryList])



    const toggleSelectAll = (e) => {
        const isSelectAll = e.currentTarget.checked

        if (isSelectAll) {
            const countryCodeList = Object.keys(stCountryMap)
            setStSelectedCountryList(countryCodeList)
            setStSelectedCityList(countryCodeList)
        } else {
            setStSelectedCountryList([])
            setStSelectedCityList([])
        }
        // console.log(isSelectAll)
        // setStIsSelectedAll(isSelectAll)
    }

    const filteredCountryList = useCallback(() => {
        let result = []
        if (stKeyword) {
            const keyword = stKeyword.toLowerCase()
            result =  Object.entries(stCountryMap).filter(([key, value]) => {
                return value.inCountry.toLowerCase().includes(keyword) || value.outCountry.toLowerCase().includes(keyword)
            })
        } else {
            result = Object.entries(stCountryMap)
        }
        return result
    }, [stKeyword, stCountryMap])

    const onClickCountry = (country) => {
        setStCityList(country.cities)
        setCurrentCountryCode(country.code)
    }

    const onCheckCity = (e) => {
        const checked = e.currentTarget.checked
        const code = e.currentTarget.value
        const [countryCode, alphaCityCode] = code.split('-')
        if (checked) {
            // check all case
            let afterAdd = [...new Set([...stSelectedCityList, code])]
            let onlyCurrentCountry = afterAdd.filter(c => c.length > 2 && c.substr(0, 2) === countryCode)
            if (onlyCurrentCountry.length === stCityList.length) {
                afterAdd = afterAdd.filter(c => c.length > 2 && c.substr(0, 2) !== countryCode) // remove all
                afterAdd.push(countryCode) // add only country code
            }
            setStSelectedCityList(afterAdd)
            setStSelectedCountryList(state => [...new Set([...state, countryCode])])
        } else {
            // check all case
            if (stSelectedCityList.includes(countryCode)) {
                // add all but current code
                let newSelected = stCityList.filter(c => c.code !== code).map(c => c.code)
                setStSelectedCityList(state => [...state.filter(c => c !== countryCode), ...newSelected])
            } else {
                const afterRemove = stSelectedCityList.filter(c => c !== code)
                setStSelectedCityList(afterRemove)
                // check empty
                if (afterRemove.filter(c => c.substr(0, 2) === countryCode).length === 0) {
                    setStSelectedCountryList(state => state.filter(c => c !== countryCode))
                }
            }

            //
            setStIsSelectedAll(false)
        }
    }

    const onCheckCountry = (e) => {
        const checked = e.currentTarget.checked
        const code = e.currentTarget.value

        if (checked) { // select all
            setStSelectedCountryList(state => [...state, code])
            setStSelectedCityList(state => [...state, code])
        } else {
            setStSelectedCountryList(state => state.filter(c => c !== code))
            let cityList = stSelectedCityList
            cityList = cityList.filter(c => c !== code && c.substr(0, 2) !== code)
            setStSelectedCityList(cityList)
        }

    }


    const countSelectedCity = (countryCode) => {
        const isSelectedAll = stSelectedCityList.includes(countryCode)
        if (isSelectedAll && !props.ignoreCountryCodeList.includes(countryCode)) return i18next.t("page.button.list.btn.allPayment")
        if (isSelectedAll) {
            let ignoreCount = props.ignoreCityCodeList.filter(c => c.substr(0, 2) === countryCode).length
            if (ignoreCount === 0) return i18next.t("page.button.list.btn.allPayment")
            return stCountryMap[countryCode].cities.length - ignoreCount
        }
        return stSelectedCityList.filter(c => c.substr(0, 2) === countryCode).length
    }


    const isCountryReadonly = useCallback((code) => {
        let countrySet = new Set()
        props.ignoreCityCodeList.forEach(code => {
            if (code.length === 2) {
                countrySet.add(code)
            }
        })
        return countrySet.has(code)
    }, [props.ignoreCityCodeList])


    const isCityReadonly = useCallback((code) => {
        const [countryCode, alphaCityCode] = code.split('-')
        if (props.ignoreCityCodeList.includes(countryCode)) {
            return true
        } else {
            return props.ignoreCityCodeList.includes(code)
        }
    }, [props.ignoreCityCodeList])

    const isCityChecked = useCallback((code) => {
        const [countryCode, alphaCityCode] = code.split('-')
        // find select all case first
        if (stSelectedCityList.includes(countryCode)) return true
        return stSelectedCityList.includes(code)
    }, [stSelectedCityList])

    const isCountryChecked = useCallback((code) => {
        return stSelectedCountryList.includes(code)
    }, [stSelectedCountryList])

    return (
        <Modal isOpen={props.isOpen} toggle={onClose} className="modal-v2">
            <ModalHeader toggle={onClose}>
                {props.mode === ShippingLocationEditorModal.EDITOR_MODE.ADD &&
                    <GSTrans t="page.setting.shippingAndPayment.btnAddShippingLocation"/>
                }
                {props.mode === ShippingLocationEditorModal.EDITOR_MODE.EDIT &&
                    <GSTrans t="page.setting.shippingAndPayment.editShippingLocation"/>
                }
            </ModalHeader>
            <ModalBody className="d-flex flex-column">
                <GSSearchInput
                    onSearch={onSearch}
                    liveSearchOnMS={500}
                    maxLength="100"
                    placeholder={i18next.t('page.setting.shippingAndPayment.add.search')}
                />
                <Styled.LocationListWrapper>
                    <Styled.LocationListHeader>
                        <div>
                            <UikCheckbox onChange={toggleSelectAll}
                                         checked={stIsSelectedAll}
                            />
                            <span className="font-weight-500">
                               <GSTrans t="common.btn.selectAll"/>
                            </span>
                        </div>
                    </Styled.LocationListHeader>
                    <Styled.LocationListBody>
                        {filteredCountryList().length === 0 &&
                            <Styled.EmptySearch>
                                <img alt="empty" src="/assets/images/empty-search.png" className="mr-2"/>
                                <span className="font-size-14px">
                                    <GSTrans t="common.noResultFound"/>
                                </span>
                            </Styled.EmptySearch>
                        }
                        <Styled.CountryListWrapper hasCity={stCityList.length > 0} className="gs-atm__scrollbar-1">
                            {stCountryMap && filteredCountryList().map(
                                ([code, country]) => {
                                    const isChecked = isCountryChecked(country.code)
                                    const readOnly = isCountryReadonly(country.code)
                                    return (
                                        <Styled.CountryRow key={'location-editor-' + country.code} readOnly={readOnly}>
                                            <UikCheckbox value={country.code}
                                                         onChange={onCheckCountry}
                                                         checked={readOnly || isChecked}
                                                         disabled={readOnly}
                                                         className={readOnly && 'disabled'}
                                            />
                                            <Styled.CountryRowName onClick={() => onClickCountry(country)}
                                                            active={stCurrentCountryCode === country.code}>
                                                <span className="country-name">
                                                    {country.outCountry}
                                                </span>
                                                {(isChecked && !readOnly) &&
                                                    <span className="white-space-nowrap font-size-14px" style={{marginLeft: '2rem'}}>
                                                        <GSTrans t="page.setting.shippingAndPayment.location.selected" values={{
                                                            selected: countSelectedCity(country.code)
                                                        }}>
                                                            Selected <strong>selected</strong>
                                                        </GSTrans>
                                                    </span>
                                                }
                                            </Styled.CountryRowName>
                                        </Styled.CountryRow>
                                    )
                                }
                            )}
                        </Styled.CountryListWrapper>
                        <Styled.CityListWrapper  hasCity={stCityList.length > 0}  className="gs-atm__scrollbar-1">
                            {stCityList.map(city => {
                                const readOnly = isCityReadonly(city.code)

                                return (
                                    <Styled.CityRow key={'location-editor-ct-' + city.code} readOnly={readOnly}>
                                        <UikCheckbox value={city.code}
                                                     onChange={onCheckCity}
                                                     checked={readOnly || isCityChecked(city.code)}
                                                     disabled={readOnly}
                                                     className={readOnly && 'disabled'}
                                        />
                                        <span>
                                        {city.outCountry}
                                    </span>
                                    </Styled.CityRow>
                                )
                            })}
                        </Styled.CityListWrapper>
                    </Styled.LocationListBody>
                </Styled.LocationListWrapper>
                <div className="text-center">
                    <em className="font-size-14px">
                        <GSTrans t="page.setting.shippingAndPayment.add.note"/>
                    </em>
                </div>
            </ModalBody>
            <ModalFooter>
                <GSButton secondary outline onClick={onClose}>
                    <GSTrans t="common.btn.cancel"/>
                </GSButton>
                <GSButton success marginLeft onClick={onDone} disabled={canDone()}>
                    <GSTrans t="common.btn.done"/>
                </GSButton>
            </ModalFooter>
        </Modal>
    );
};

ShippingLocationEditorModal.propTypes = {
    isOpen: PropTypes.bool,
    onClose: PropTypes.func,
    onDone: PropTypes.func,
    ignoreCityCodeList: PropTypes.array,
    ignoreCountryCodeList: PropTypes.array,
    editLocation: PropTypes.object,
};

ShippingLocationEditorModal.EDITOR_MODE = {
    'ADD': 'ADD',
    'EDIT': 'EDIT'
}

export default ShippingLocationEditorModal;
