/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 09/11/2021
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React, {useState} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";
import GSActionButton, {GSActionButtonIcons} from "../../../../../components/shared/GSActionButton/GSActionButton";
import GSTrans from "../../../../../components/shared/GSTrans/GSTrans";
import {CurrencyUtils, NumberUtils} from "../../../../../utils/number-format";
import i18next from "i18next";
import {useRecoilValue} from "recoil";
import {SelfDeliveryConfigurationRecoil} from "../recoil/SelfDeliveryConfigurationRecoil";
import GSFakeLink from "../../../../../components/shared/GSFakeLink/GSFakeLink";
import ComponentOverflowDetector
    from "../../../../../components/shared/ComponentOverflowDetector/ComponentOverflowDetector";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {StringUtils} from "../../../../../utils/string";
import {xs} from "../../../../../utils/styled-breakpoints";
import GSComponentTooltip, {
    GSComponentTooltipTrigger
} from "../../../../../components/shared/GSComponentTooltip/GSComponentTooltip";
import GSTooltip from "../../../../../components/shared/GSTooltip/GSTooltip";
import * as Styled from './SelfDeliveryConfigLocation.styled'

const CONDITION_RULE = {
    BASE_ON_PRODUCT_WEIGHT: 'BASE_ON_PRODUCT_WEIGHT',
    BASE_ON_TOTAL_ORDER_AMOUNT: 'BASE_ON_TOTAL_ORDER_AMOUNT'
}


const SelfDeliveryConfigLocation = props => {
    const {currency, ...others} = props
    /**
     * @type {CountryVM[]}
     */
    const stCountryMap = useRecoilValue(SelfDeliveryConfigurationRecoil.countryMapState)

    /**
     * @type {SelfDeliverySettingVM}
     */
    const location = props.data

    const [stIsCountryNameOverflow, setStIsCountryNameOverflow] = useState(false);
    const [stIsCollapsedCountryName, setStIsCollapsedCountryName] = useState(true);

    /**
     * @param {ShippingRuleDTO} rule
     */
    const renderCondition = (rule) => {
        const unit = rule.conditionUnit
        let from, to
        if (rule.condition === CONDITION_RULE.BASE_ON_PRODUCT_WEIGHT) {
            from = NumberUtils.formatThousand(rule.fromRange) + 'g'
            to = rule.toRange || rule.toRange === 0 ? NumberUtils.formatThousand(rule.toRange) + 'g': i18next.t('page.setting.shippingAndPayment.rule.table.condition.noLimit')
            return from + ' - ' + to
        }
        if (rule.condition === CONDITION_RULE.BASE_ON_TOTAL_ORDER_AMOUNT) {
            from = CurrencyUtils.formatMoneyByCurrency(rule.fromRange, unit)
            to = rule.toRange || rule.toRange === 0 ? CurrencyUtils.formatMoneyByCurrency(rule.toRange, unit): i18next.t('page.setting.shippingAndPayment.rule.table.condition.noLimit')
            return from + ' - ' + to
        }
    }

    const renderCountryName = () => {
        let renderedList = []

        let countryList = location.allowedCountryCodeList.map(code => stCountryMap[code])
        for (let cIndex = 0; cIndex < countryList.length; cIndex++) {
            const country = countryList[cIndex]
            const code = country.code
            // select all case
            let selectAll  = location.allowedLocations.find(lCode => lCode === code)
            if (selectAll) { // select all -> show country only
                renderedList.push(<Styled.CountryTag key={location.allowedLocationCodes} className={cIndex !== countryList.length-1? 'comma':''}>{country.outCountry}</Styled.CountryTag>)
                continue
            }

            // none select all
            let cityCodeList = location.allowedLocations.filter(lCode => lCode.substr(0, 2) === code)
            let cityNameList = country.cities.filter(city => cityCodeList.includes(city.code)).map(c => c.outCountry)
            renderedList.push(
                <Styled.CountryTag key={location.allowedLocationCodes}
                            className={cIndex !== countryList.length-1? 'comma':''}
                >
                    {country.outCountry}&nbsp;
                    <GSComponentTooltip display="inline-block"
                                        message={cityNameList.join(", ")}
                                        placement={GSTooltip.PLACEMENT.BOTTOM_LEFT}
                                        theme="light"
                                        className="cursor--pointer"
                    >
                        <span style={{color: '#2374F8'}}>
                        ({cityCodeList.length})
                    </span>
                    </GSComponentTooltip>
                </Styled.CountryTag>
            )

        }
        return renderedList
    }

    const toggleCountryName = () => {
        setStIsCollapsedCountryName(state => !state)
    }

    return (
        <Styled.LocationWrapper>
            <Styled.Header>
                <ComponentOverflowDetector onOverflow={setStIsCountryNameOverflow}>
                    <Styled.CountryNameHeading isCollapsed={stIsCollapsedCountryName}>
                        {renderCountryName()}

                        {stIsCountryNameOverflow &&
                            <FontAwesomeIcon icon="caret-down"
                                             className="gsa-hover--fadeOut cursor--pointer"
                                             onClick={toggleCountryName}/>
                        }
                    </Styled.CountryNameHeading>
                </ComponentOverflowDetector>
                <Styled.ActionsHeading>
                    <GSFakeLink onClick={() => props.onAddRule(props.index)}>
                        <GSTrans t="page.setting.shippingAndPayment.rule.btn.add"/>
                    </GSFakeLink>
                    <GSFakeLink onClick={() => props.onRemove(props.index)}>
                        <GSTrans t="common.btn.delete" />
                    </GSFakeLink>
                    <GSFakeLink onClick={() => props.onEdit(props.index)}>
                        <GSTrans t="common.btn.edit"/>
                    </GSFakeLink>
                </Styled.ActionsHeading>
            </Styled.Header>
            <Styled.Body>
                <Styled.RuleTable>
                    <thead>
                        <tr>
                            <th>
                                <GSTrans t="page.setting.shippingAndPayment.rule.table.name"/>
                            </th>
                            <th>
                                <GSTrans t="page.setting.shippingAndPayment.rule.table.condition"/>
                            </th>
                            <th>
                                <GSTrans t="page.setting.shippingAndPayment.rule.table.fee"/>
                            </th>
                            <th/>
                        </tr>
                    </thead>

                    <tbody>
                    {location.shippingRuleList.map(
                        /**
                         * @param {ShippingRuleDTO} rule
                         * @param {Number} index
                         */
                        (rule, index) => (
                        <tr key={StringUtils.hashCode(rule.name + '-' + index)}>
                            <td>
                                {rule.name}
                            </td>
                            <td>
                                {renderCondition(rule)}
                            </td>
                            <td>
                                {CurrencyUtils.formatMoneyByCurrency(rule.shippingFee || 0, currency)}
                            </td>
                            <td>
                                <div className="d-flex justify-content-md-end flex-md-row flex-column align-items-end">
                                    <GSActionButton icon={GSActionButtonIcons.EDIT}
                                                    className="mr-0 mb-3 mb-md-0 mr-md-3"
                                                    onClick={() => props.onEditRule(props.index, index)}/>
                                    <GSActionButton icon={GSActionButtonIcons.DELETE}
                                                    onClick={() => props.onRemoveRule(props.index, index)}/>
                                </div>
                            </td>
                        </tr>
                    ))}

                    </tbody>
                </Styled.RuleTable>
                {location.shippingRuleList.length === 0 &&
                    <Styled.EmptyTable>
                        <GSTrans t="page.setting.shippingAndPayment.rule.addRuleHint"/>
                    </Styled.EmptyTable>
                }
            </Styled.Body>
        </Styled.LocationWrapper>
    );
};

SelfDeliveryConfigLocation.defaultProps = {
    currency: CurrencyUtils.getLocalStorageSymbol()
};

SelfDeliveryConfigLocation.propTypes = {
    data: PropTypes.object,
    index: PropTypes.number,
    onRemove: PropTypes.func,
    onEdit: PropTypes.func,
    onAddRule: PropTypes.func,
    onEditRule: PropTypes.func,
    onRemoveRule: PropTypes.func,
    currency: PropTypes.string,
};

export default SelfDeliveryConfigLocation;
