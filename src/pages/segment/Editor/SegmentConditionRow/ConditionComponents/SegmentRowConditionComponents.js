import i18next from "i18next";
import {AvField} from "availity-reactstrap-validation";
import storage from "../../../../../services/storage";
import AvFieldCurrency from "../../../../../components/shared/AvFieldCurrency/AvFieldCurrency";
import {CurrencySymbol} from "../../../../../components/shared/form/CryStrapInput/CryStrapInput";
import {FormValidate} from "../../../../../config/form-validate";
import React, {useContext} from "react";
import {CustomerSegmentEditorContext} from "../../CustomerSegmentEditor";
import PrivateComponent from "../../../../../components/shared/PrivateComponent/PrivateComponent";
import {PACKAGE_FEATURE_CODES} from "../../../../../config/package-features";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import AvFieldIcon, {AvFieldIconPosition} from "../../../../../components/shared/AvFieldIcon/AvFieldIcon";
import {CurrencyUtils} from "../../../../../utils/number-format";

/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 03/10/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/


export const selectorTree = {
    'root': ['Customer Data', 'Order Data'],
    'Customer Data': ['Registration date', 'Customer tag', 'Installed app'],
    'Registration date': ['is', 'before', 'after'],
    'Customer tag': ['is equal to'],
    'Installed app': ['is equal to'],
    'Order Data': ['Last Delivery Location','Total Order Number','Total Purchase Amount'],
    'Last Delivery Location': ['in', 'not in'],
    'Total Order Number': ['is equal to', 'is greater than', 'is less than'],
    'Total Purchase Amount': ['is equal to', 'is greater than', 'is less than'],
    'Purchased Product': ['null'],
    'Product Modal': ['null'],
    'null': ['']
}
export const valueMapping = (selectorName, defaultValue, rowKey, onChange = undefined) => {
    switch (selectorName) {
        case 'Registration date':
            return <DateValue onChange={onChange} defaultValue={defaultValue} rowKey={rowKey}/>
        case 'Customer tag':
            return <TagValue onChange={onChange} defaultValue={defaultValue} rowKey={rowKey}/>
        case 'Installed app':
            return <InstalledAppValue onChange={onChange} defaultValue={defaultValue} rowKey={rowKey}/>
        case 'Last Delivery Location':
            return <LocationValue onChange={onChange} defaultValue={defaultValue} rowKey={rowKey}/>
        case 'Total Order Number':
            return <NumberValue onChange={onChange} defaultValue={defaultValue} rowKey={rowKey}/>
        case 'Total Purchase Amount':
            return <CurrencyValue onChange={onChange} defaultValue={defaultValue} rowKey={rowKey}/>
        default:
            return null
    }
}
export const selectorMapping = (id, defaultValue, rowKey, onChange) => {


    switch (id) {
        case 'root':
            return <RootSelect onChange={onChange} rowKey={rowKey} defaultValue={defaultValue}/>
        case 'Customer Data':
            return <CustomerDataSelect onChange={onChange} rowKey={rowKey}  defaultValue={defaultValue}/>
        case 'Order Data':
            return <OrderDataSelect onChange={onChange} rowKey={rowKey}  defaultValue={defaultValue}/>
        case 'Registration date':
            return <RegistrationDateSelect onChange={onChange} rowKey={rowKey}  defaultValue={defaultValue}/>
        case 'Customer tag':
            return <CustomerTagSelect onChange={onChange} rowKey={rowKey}  defaultValue={defaultValue}/>
        case 'Installed app':
            return <InstalledAppSelect onChange={onChange} rowKey={rowKey} defaultValue={defaultValue}/>
        case 'Last Delivery Location':
            return <LastDeliveryLocationSelect onChange={onChange} rowKey={rowKey} defaultValue={defaultValue}/>
        case 'Total Order Number':
            return <TotalOrderNumberSelect onChange={onChange} rowKey={rowKey} defaultValue={defaultValue}/>
        case 'Total Purchase Amount':
            return <TotalPurchaseAmountSelect onChange={onChange} rowKey={rowKey} defaultValue={defaultValue}/>
        case 'Expired Time':
            return <ExpiredTimeSelect onChange={onChange} rowKey={rowKey} defaultValue={defaultValue}/>
        default:
            return null
    }
}

export const ExpiredTimeSelect = props => {
    return (
        <AvField type="select"
                 name={'row_' + props.rowKey}
                 onChange={props.onChange}
                 defaultValue={props.defaultValue}>
            <option value="ALL">
                {i18next.t("page.customers.segments.expiredTime.all")}
            </option>
            <option value="PER_MONTH">
                {i18next.t("page.customers.segments.expiredTime.month")}
            </option>
            <option value="PER_QUARTER">
                {i18next.t("page.customers.segments.expiredTime.quarter")}
            </option>
            <option value="PER_YEAR">
                {i18next.t("page.customers.segments.expiredTime.year")}
            </option>
        </AvField>
    )
}

export const RootSelect = props => {
    return (
        <AvField type="select"
                 name={'row_' + props.rowKey + '_selector_0'}
                 onChange={props.onChange}
                 defaultValue={props.defaultValue}>
            <option value="Customer Data">
                {i18next.t("page.customers.segments.customersData")}
            </option>
            <option value="Order Data">
                {i18next.t("page.customers.segments.orderData")}
            </option>
            <option value="Purchased Product">
                {i18next.t("page.customers.segments.purchasedProduct")}
            </option>
        </AvField>
    )
}

export const CustomerDataSelect = props => {
    return (
        <AvField type="select"
                 name={'row_' + props.rowKey + '_selector_1'}
                 className="form-control"
                 onChange={props.onChange}
                 defaultValue={props.defaultValue} >
            <option value="Registration date">
                {i18next.t("page.customers.segments.registrationDate")}
            </option>
            <option value="Customer tag">
                {i18next.t("page.customers.segments.customerTag")}
            </option>
            <PrivateComponent hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.FEATURE_0143]}>
                <option value="Installed app">
                    {i18next.t("page.customers.segments.installedApp")}
                </option>
            </PrivateComponent>

        </AvField>
    )
}
export const RegistrationDateSelect = props => {
    return (
        <AvField type="select"
                 name={'row_' + props.rowKey + '_selector_2'}
                 className="form-control"
                 onChange={props.onChange}
                 defaultValue={props.defaultValue} >
            <option value="is">
                {i18next.t("page.customers.segments.is")}
            </option>
            <option value="is before">
                {i18next.t("page.customers.segments.isBefore")}
            </option>
            <option value="is after">
                {i18next.t("page.customers.segments.isAfter")}
            </option>
        </AvField>
    )
}
export const CustomerTagSelect = props => {
    return (
        <AvField type="select"
                 name={'row_' + props.rowKey + '_selector_2'}
                 className="form-control"
                 onChange={props.onChange}
                 defaultValue={props.defaultValue}>
            <option value="is equal to">
                {i18next.t("page.customers.segments.isEqualTo")}
            </option>
        </AvField>
    )
}
export const InstalledAppSelect = props => {
    return (
        <AvField type="select"
                 name={'row_' + props.rowKey + '_selector_2'}
                 className="form-control"
                 onChange={props.onChange}
                 defaultValue={props.defaultValue}>
            <option value="is equal to">
                {i18next.t("page.customers.segments.isEqualTo")}
            </option>
        </AvField>
    )
}
export const OrderDataSelect = props => {
    return (
        <AvField type="select"
                 name={'row_' + props.rowKey + '_selector_1'}
                 className="form-control"
                 onChange={props.onChange}
                 defaultValue={props.defaultValue}
        >
            <option value="Last Delivery Location">
                {i18next.t("page.customers.segments.lastDelivery")}
            </option>
            <option value="Total Order Number">
                {i18next.t("page.customers.segments.totalOrderCount")}
            </option>
            <option value="Total Purchase Amount">
                {i18next.t("page.customers.segments.totalPurchaseAmount")}
            </option>
        </AvField>
    )
}
export const LastDeliveryLocationSelect = props => {
    return (
        <AvField type="select"
                 name={'row_' + props.rowKey + '_selector_2'}
                 className="form-control"
                 onChange={props.onChange}
                 defaultValue={props.defaultValue}>
            <option value="in">
                {i18next.t("page.customers.segments.in")}
            </option>
            <option value="not in">
                {i18next.t("page.customers.segments.notIn")}
            </option>
        </AvField>
    )
}
export const TotalOrderNumberSelect = props => {
    return (
        <AvField type="select"
                 name={'row_' + props.rowKey + '_selector_2'}
                 className="form-control"
                 onChange={props.onChange}
                 defaultValue={props.defaultValue} >
            <option value="is equal to">
                {i18next.t("page.customers.segments.isEqualTo")}
            </option>
            <option value="is greater than">
                {i18next.t("page.customers.segments.isGreaterThan")}
            </option>
            <option value="is less than">
                {i18next.t("page.customers.segments.isLessThan")}
            </option>
        </AvField>
    )
}
export const TotalPurchaseAmountSelect = props => {
    return (
        <AvField type="select"
                 name={'row_' + props.rowKey + '_selector_2'}
                 className="form-control"
                 onChange={props.onChange}
                 defaultValue={props.defaultValue}>
            <option value="is equal to">
                {i18next.t("page.customers.segments.isEqualTo")}
            </option>
            <option value="is greater than">
                {i18next.t("page.customers.segments.isGreaterThan")}
            </option>
            <option value="is less than">
                {i18next.t("page.customers.segments.isLessThan")}
            </option>
        </AvField>
    )
}
export const DateValue = props => {
    return (
        <AvField type="date"
                 name={'row_' + props.rowKey + '_value'}
                 onChange={props.onChange}
                 defaultValue={props.defaultValue}
                    validate={{
                     ...FormValidate.required()
                 }}/>
    )
}
export const TagValue = props => {
    const {stCustomerTags} = useContext(CustomerSegmentEditorContext);

    const checkDefaultValue = () => {
        if (props.defaultValue) {
            // check defaultValue in stCustomerTags
            const tag = stCustomerTags.filter(customer => customer === props.defaultValue)
            if (tag[0]) { // => ok
               return props.defaultValue
            } else { // tag has been deleted
                return null
            }

        }
        return null
    }

    return (
        <div>
            {/*<AvField type="select"
                    name={'row_' + props.rowKey + '_value'}
                    onChange={props.onChange}
                    defaultValue={checkDefaultValue()}>
                <option/>
                {
                    stCustomerTags.map((x, index) => {
                        return (<option value={x} key={x}>{x}</option>);
                    })
                }
            </AvField> */}
            <AvFieldIcon
                name={'row_' + props.rowKey + '_value'}
                list="customerTags"
                onChange={props.onChange}
                defaultValue={props.defaultValue}
                icon={(
                    <FontAwesomeIcon icon="search"/>
                )}
                iconPosition={AvFieldIconPosition.LEFT}
            />
            <datalist id="customerTags">
                {stCustomerTags.map((x, index) => {
                    return (<option value={x} key={x}>{x}</option>);
                })}
            </datalist> 
        </div>
    )
}
export const InstalledAppValue = props => {
    return (
        <AvField type="select"
                 name={'row_' + props.rowKey + '_value'}
                 onChange={props.onChange}
                 defaultValue={props.defaultValue? props.defaultValue:'None' }
                 validate={{
                     ...FormValidate.required()
                 }}>
            <option value="None">
                {i18next.t("page.customers.segments.none")}
            </option>
            <option value="Android">Android</option>
            <option value="iOS">iOS</option>
        </AvField>
    )
}
export const LocationValue = props => {
    const {stCities} = useContext(CustomerSegmentEditorContext);

    return (
        <AvField type="select"
                 name={'row_' + props.rowKey + '_value'}
                 onChange={props.onChange}
                 defaultValue={props.defaultValue? props.defaultValue:stCities[0].code}
                 validate={{
                     ...FormValidate.required()
                 }}
        >
            {
                stCities.map((x, index) => {
                    if (storage.getFromLocalStorage('langKey').toLowerCase() === "vi") {
                        return (<option value={x.code} key={index} defaultValue={props.defaultValue}>{x.inCountry}</option>);
                    }
                    else {
                        return (<option value={x.code} key={index} defaultValue={props.defaultValue}>{x.outCountry}</option>);
                    }
                })
            }
        </AvField>
    )
}
export const NumberValue = props => {
    return (
        <AvFieldCurrency
            name={'row_' + props.rowKey + '_value'}
            type="number"
            unit={CurrencySymbol.NONE}
            onChange={props.onChange}
            value={props.defaultValue}
            validate={{
                ...FormValidate.number(),
                ...FormValidate.required(),
                ...FormValidate.minValue(0),
                ...FormValidate.maxValue(999_999_999_999, true)
            }}
        />
    )
}
export const CurrencyValue = props => {
    return (
        <AvFieldCurrency
            name={'row_' + props.rowKey + '_value'}
            type="number"
            unit={CurrencyUtils.getLocalStorageSymbol()}
            onChange={props.onChange}
            value={props.defaultValue}
            validate={{
                ...FormValidate.number(),
                ...FormValidate.required(),
                ...FormValidate.minValue(0),
                ...FormValidate.maxValue(999_999_999_999, true)
            }}
            position={CurrencyUtils.isPosition(CurrencyUtils.getLocalStorageSymbol())}
            precision={CurrencyUtils.isCurrencyInput(CurrencyUtils.getLocalStorageSymbol()) && '2'}
            decimalScale={CurrencyUtils.isCurrencyInput(CurrencyUtils.getLocalStorageSymbol()) && 2}
        />
    )
}
