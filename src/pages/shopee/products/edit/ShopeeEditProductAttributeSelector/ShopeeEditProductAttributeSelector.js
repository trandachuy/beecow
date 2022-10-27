/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 04/08/2021
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React, {useEffect, useImperativeHandle, useState} from "react";
import PropTypes from "prop-types";
import shopeeService from "../../../../../services/ShopeeService";
import "./ShopeeEditProductAttributeSelector.sass";
import Loading, {LoadingStyle,} from "../../../../../components/shared/Loading/Loading";
import {AvField} from "availity-reactstrap-validation";
import {FormValidate} from "../../../../../config/form-validate";
import AvFieldGroup from "../../../../../components/shared/AvFieldGroup/AvFieldGroup";
import i18n from "i18next";
import moment from "moment";
import GSSelect from "../../../../../components/shared/form/GSSelect/GSSelect";
import AlertInline, {AlertInlineType,} from "../../../../../components/shared/AlertInline/AlertInline";
import _ from "lodash";

const INPUT_TYPE = {
    DROP_DOWN: 'DROP_DOWN',
    MULTIPLE_SELECT: 'MULTIPLE_SELECT',
    TEXT_FILED: 'TEXT_FILED',
    COMBO_BOX: 'COMBO_BOX',
    MULTIPLE_SELECT_COMBO_BOX: 'MULTIPLE_SELECT_COMBO_BOX',
    BRAND: 'BRAND'
}

const INPUT_VALIDATION_TYPE = {
    INT_TYPE: 'INT_TYPE',
    STRING_TYPE: 'STRING_TYPE',
    ENUM_TYPE: 'ENUM_TYPE',
    FLOAT_TYPE: 'FLOAT_TYPE',
    DATE_TYPE: 'DATE_TYPE',
    TIMESTAMP_TYPE: 'TIMESTAMP_TYPE'
}

const FORMAT_TYPE = {
    NORMAL: 'NORMAL',
    QUANTITATIVE: 'QUANTITATIVE'
}

const DATE_FORMAT_TYPE = {
    YEAR_MONTH_DATE: 'YEAR_MONTH_DATE',
    YEAR_MONTH: 'YEAR_MONTH'
}

const VALUE_SEPARATOR = '@$$@'
export const BRAND_ATTR_ID = -1

const ShopeeEditProductAttributeSelector = React.forwardRef((props, ref) => {
    const [stAttrList, setStAttrList] = useState([]);
    const [stFetching, setStFetching] = useState(false);
    const [stInvalidAttrIdList, setStInvalidAttrIdList] = useState([]);
    const [stShowAllError, setStShowAllError] = useState(false);
    const [stAttrValues, setStAttrValues] = useState({});

    useImperativeHandle(
        ref,
        () => ({
            getValue: () => getValue(),
            isValid: () => isValid(),
        }),
        [stAttrValues, stInvalidAttrIdList],
    );
    

    useEffect(() => {
        setStFetching(true)
        shopeeService.getAttributes(props.categoryId, props.shopeeShopId)
           .then(attributeList => {
               shopeeService.getBrandList(props.categoryId, props.shopeeShopId)
                   .then(brandResponse => {
                       const brandList = brandResponse.brand_list
                       let arrList = attributeList.sort((a, b) => b.is_mandatory - a.is_mandatory || a.attribute_id - b.attribute_id)

                       // ======================
                       //   WITH DEFAULT VALUE
                       // ======================
                       if (props.defaultValue && props.defaultValue.length > 0) {
                           props.defaultValue.forEach(dValue => {
                               let attr = arrList.find(a => a.attribute_id === dValue.attributeId)
                               if (attr) {
                                   attr.defaultValue = dValue.values
                               }
                           })
                       }

                       // map brand list
                       if (brandList && brandList.length > 0) {
                           let brandAttr = {
                               attribute_value_list: brandList.map(brand => ({
                                   value_id: brand.brand_id,
                                   display_value_name: brand.display_brand_name,
                                   original_value_name: brand.original_brand_name
                               })),
                               is_mandatory: true,
                               attribute_id: BRAND_ATTR_ID,
                               input_type: INPUT_TYPE.BRAND,
                               display_attribute_name: i18n.t('page.shopee.products.attr.brand')
                           }

                           if (props.defaultBrand) {
                               brandAttr.defaultValue = [
                                   {
                                       value_id: props.defaultBrand.brand_id
                                   }
                               ]
                           }

                           arrList = [brandAttr, ...arrList]
                       }
                       setStAttrList(arrList)
                   })
                   .finally(() => {
                       setStFetching(false)
                   })
           })
           .catch(() => {
               setStFetching(false)
           })


    }, [props.categoryId]);

    /**
     * Get value to Shopee request model
     * @return {ShopeeRequestAttributeModel[]}
     */
    const getValue = () => {
        /**
         * @type {ShopeeRequestAttributeModel[]}
         */
        let result = []


        for (const [attrId, attrValue] of Object.entries(stAttrValues)) {
            /**
             * @type {ShopeeAttributeModel}
             */
            const attrData = stAttrList.find(attr => attr.attribute_id == attrId)

            /**
             * @type {ShopeeRequestAttributeValueModel[]}
             */
            let attribute_value_list = []
            // compact attr_value
            const  isNotNull = v => v !== null && v !== undefined

            switch (attrData.input_type) {
                case INPUT_TYPE.TEXT_FILED: {
                    const [originalValueName, unit] = String(attrValue).split(VALUE_SEPARATOR)
                    attribute_value_list.push(_.pickBy({
                        value_id: 0, // required
                        original_value_name: originalValueName,
                        value_unit: unit || undefined
                    }, isNotNull))
                }
                break
                case INPUT_TYPE.DROP_DOWN:
                case INPUT_TYPE.COMBO_BOX:
                    const [valueId, unit, isCustom] = attrValue.value.split(VALUE_SEPARATOR)
                    attribute_value_list.push(_.pickBy({
                        value_id: isCustom? 0: parseInt(valueId),
                        original_value_name: isCustom? valueId:undefined,
                        value_unit: unit !== 'undefined'? unit:undefined
                    }, isNotNull))
                    break
                case INPUT_TYPE.MULTIPLE_SELECT:
                case INPUT_TYPE.MULTIPLE_SELECT_COMBO_BOX:
                    for (const subValue of attrValue) {
                        const [valueId, unit, isCustom] = subValue.value.split(VALUE_SEPARATOR)
                        attribute_value_list.push(_.pickBy({
                            value_id: isCustom? 0: parseInt(valueId),
                            original_value_name: isCustom? valueId:undefined,
                            value_unit: unit !== 'undefined'? unit:undefined
                        }, isNotNull))
                    }

                    break
                case INPUT_TYPE.BRAND:
                    {
                        const [valueId, unit] = attrValue.value.split(VALUE_SEPARATOR)
                        const brandAttr = stAttrList.find(attr => attr.attribute_id === BRAND_ATTR_ID);
                        if (brandAttr) {
                            const selectedBrand = brandAttr.attribute_value_list.find(attrV => attrV.value_id === parseInt(valueId))
                            attribute_value_list.push(_.pickBy({
                                value_id: parseInt(valueId),
                                original_value_name: selectedBrand.original_value_name
                            }, isNotNull))
                        }


                    }
            }

            if (attribute_value_list.length > 0) {
                result.push({
                    attribute_id: parseInt(attrId),
                    attribute_value_list: attribute_value_list
                })
            }
        }
        return result;
    }

    const isValid = () => {
        setStShowAllError(true)
        return stInvalidAttrIdList.length === 0
    }

    const onAttrValidChange = (isValid, attrId) => {
        const invalidSet = new Set([...stInvalidAttrIdList])
        if (!isValid) {
            invalidSet.add(attrId)
        } else {
            invalidSet.delete(attrId)
        }
        setStInvalidAttrIdList([...invalidSet])
    }

    /**
     * @param {ShopeeAttributeModel} attr
     * @param value
     */
    const onChangeAttributeValue = (attr, value, unit) => {



        setStAttrValues(state => {
            let attrList = _.cloneDeep(state)
            switch (attr.input_type) {
                case INPUT_TYPE.TEXT_FILED:
                    attrList[attr.attribute_id] = unit? value + VALUE_SEPARATOR + unit: value
                    break
                case INPUT_TYPE.DROP_DOWN:
                case INPUT_TYPE.COMBO_BOX:
                case INPUT_TYPE.MULTIPLE_SELECT:
                case INPUT_TYPE.MULTIPLE_SELECT_COMBO_BOX:
                case INPUT_TYPE.BRAND:
                    attrList[attr.attribute_id] = value
                    break
            }
            return attrList
        })
    }


    /**
     * @param {ShopeeAttributeModel} attr
     */
    const onChangeAttributeUnit = (attr, unit) => {
        let attrList = _.cloneDeep(stAttrValues)
        const [value, oldUnit] = attrList[attr.attribute_id].split(VALUE_SEPARATOR)
        attrList[attr.attribute_id] = unit? value + VALUE_SEPARATOR + unit: value
        setStAttrValues(attrList)
    }

    return (
        <div className="shopee-edit-product-attr-selector mt-3">
            {stFetching &&
                <div>
                    <Loading style={LoadingStyle.DUAL_RING_GREY}/>
                </div>
            }

            {/*ATTRIBUTES*/}
            <div className="shopee-edit-product-attr-selector__select-container">
                {!stFetching && stAttrList.map(attr => <Attribute data={attr}
                                                                  onValidChange={onAttrValidChange}
                                                                  showError={stShowAllError}
                                                                  onChange={onChangeAttributeValue}
                                                                  onChangeUnit={onChangeAttributeUnit}
                />)}
            </div>

        </div>
    );
});

const ATTR_VALIDATE = {
    TEXT_FILED: {
        MAX_LENGTH: 40
    },
    MULTIPLE_SELECT_COMBO_BOX: {
        MAX_LENGTH: 5
    },
    MULTIPLE_SELECT: {
        MAX_LENGTH: 5
    }
}


const Attribute = props => {
    /**
     * @type ShopeeAttributeModel
     */
    const data = props.data
    const isEditMode = !!data.defaultValue

    const [stValue, setStValue] = useState(null);
    const [stTouched, setStTouched] = useState(false);
    const [stValid, setStValid] = useState(!data.is_mandatory);
    const [stUnit, setStUnit] = useState(data.attribute_unit? data.attribute_unit[0]:undefined);

    // map default value
    useEffect(() => {
        if (isEditMode) {
            const dValueList = data.defaultValue
            const dValueIdList = data.defaultValue.map(dValue => dValue.value_id)
            const attribute_value_list = data.attribute_value_list
            let value = ''
            switch (props.data['input_type']) {
                case INPUT_TYPE.TEXT_FILED:
                    // with this type, value is the first item in value array
                    const textFieldValueObj = dValueList[0]
                    const textValue = textFieldValueObj.original_value_name
                    const unit = textFieldValueObj.value_unit
                    // DATETIME TYPE
                    if (data.input_validation_type === INPUT_VALIDATION_TYPE.DATE_TYPE || data.input_validation_type === INPUT_VALIDATION_TYPE.TIMESTAMP_TYPE) {
                        switch (data.date_format_type) {
                            case DATE_FORMAT_TYPE.YEAR_MONTH:
                                value = moment(parseInt(textValue)* 1000).format("YYYY-MM")
                                break
                            case DATE_FORMAT_TYPE.YEAR_MONTH_DATE:
                                value = moment(parseInt(textValue)* 1000).format("YYYY-MM-DD")
                                break
                        }
                    }
                    if (data.input_validation_type === INPUT_VALIDATION_TYPE.INT_TYPE
                        || data.input_validation_type === INPUT_VALIDATION_TYPE.STRING_TYPE
                        || data.input_validation_type === INPUT_VALIDATION_TYPE.ENUM_TYPE
                        || data.input_validation_type === INPUT_VALIDATION_TYPE.FLOAT_TYPE) {
                        value = textValue
                    }
                    if (unit) {
                        setStUnit(unit)
                    }
                    break
                case INPUT_TYPE.DROP_DOWN:
                case INPUT_TYPE.COMBO_BOX:
                case INPUT_TYPE.BRAND:
                    const jsonValue = attribute_value_list.find(attr => dValueIdList.includes(attr.value_id))
                    value = {
                        value: resolveAttrValue(jsonValue.value_id, jsonValue.value_unit),
                        label: formatOptionLabel(jsonValue.display_value_name, jsonValue.value_unit),
                    }
                    break
                case INPUT_TYPE.MULTIPLE_SELECT:
                case INPUT_TYPE.MULTIPLE_SELECT_COMBO_BOX:
                    value = attribute_value_list.filter(attr => dValueIdList.includes(attr.value_id))
                        .map(attr => ({
                        value: resolveAttrValue(attr.value_id, attr.value_unit),
                        label: formatOptionLabel(attr.display_value_name, attr.value_unit),
                    }))
                    break

            }
            if (value) {
                setStValue(value)
                onChange(null, value)
            }
        }
    }, [])



    /**
     * Get RAW value by attribute type
     * Validation:
     * - Multiple maximum select: 5
     * - Required by is_mandatory
     *
     * Returned value examples:
     * Input        |   attr type    |        Callback Output
     * hello        |   TEXT_FILED   |     hello
     * 2021-02-01   |   TEXT_FILED   |     timestamp
     * {label, value}  |   DROP_DOWN   |     {label, value}
     *
     * @param event
     * @param value
     */
    const onChange = (event, value) => {
        // validate select
        if (Array.isArray(value)) {
            if (value.length > ATTR_VALIDATE.MULTIPLE_SELECT_COMBO_BOX.MAX_LENGTH) {
                return
            }
        }
        setStValue(value)




        // check valid
        if (data.is_mandatory) {
            if (value === '' || value === undefined || value == null || (Array.isArray(value) && value.length === 0)) {
                props.onValidChange(false, data.attribute_id)
                setStValid(false)
            } else {
                props.onValidChange(true, data.attribute_id)
                setStValid(true)
            }
        }

        // normalize data
        let finalValue = value
        if (typeof finalValue != 'object' && (data.input_validation_type === INPUT_VALIDATION_TYPE.DATE_TYPE || data.input_validation_type === INPUT_VALIDATION_TYPE.TIMESTAMP_TYPE)) {
            finalValue = Math.round(Date.parse(finalValue).valueOf() / 1000)
        }

        // callback
        if (!Array.isArray(finalValue)) {
            // for TEXT_FIELD, DROPBOX, COMBOBOX, BRAND
            props.onChange(data, finalValue, stUnit)
        } else {
            // for MULTIPLE SELECT
            props.onChange(data, finalValue)
        }
    }

    const onTouched = () => {
        if (!stTouched) {
            setStTouched(true)
        }
    }



    const inputTypeToHtml5Type = (inputValidationType, dateFormatType) => {
        switch (inputValidationType) {
            case INPUT_VALIDATION_TYPE.STRING_TYPE:
                return "text"
            case INPUT_VALIDATION_TYPE.INT_TYPE:
                return "number"
            case INPUT_VALIDATION_TYPE.DATE_TYPE:
                switch (dateFormatType) {
                    case DATE_FORMAT_TYPE.YEAR_MONTH:
                        return "month"
                    case DATE_FORMAT_TYPE.YEAR_MONTH_DATE:
                        return "date"
                }
        }
    }

    const resolveAttrValue = (value, unit) => {
        return value + VALUE_SEPARATOR + unit
    }

    const formatOptionLabel = (value, unit) => {
        const {input_validation_type, date_format_type} = data
        if (input_validation_type === INPUT_VALIDATION_TYPE.DATE_TYPE) {
            const dateObj = new Date(parseInt(value + '000'))
            switch (date_format_type) {
                case DATE_FORMAT_TYPE.YEAR_MONTH_DATE:
                    return moment(dateObj).format("DD/MM/YYYY")
                case DATE_FORMAT_TYPE.YEAR_MONTH:
                    return moment(dateObj).format("MM/YYYY")
            }
        }
        return value + (unit || '')// un-format
    }

    const onChangeUnit = (e) => {
        const newUnit = e.currentTarget.value
        setStUnit(e.currentTarget.value)
        props.onChangeUnit(data, newUnit)
    }

    /**
     * SELECT SINGLE
     * MAX LENGTH: 1
     * CREATABLE OPTIONS: FALSE
     * @return {JSX.Element}
     * @constructor
     */
    const DropDown = () => {
        const {attribute_value_list} = data
        const options = attribute_value_list.map(attr => ({
            value: resolveAttrValue(attr.value_id, attr.value_unit),
            label: formatOptionLabel(attr.display_value_name, attr.value_unit),
        }))

        return (
            <GSSelect
                options={options}
                placeholder={i18n.t('page.shopee.product.pleaseSelect')}
                onChange={value => onChange(null, value)}
                value={stValue}
            >

            </GSSelect>
        )
    }


    const TextField = () => {
        const {attribute_unit, attribute_id, date_format_type, input_validation_type, format_type} = data

        return (
            <>
                {format_type === FORMAT_TYPE.QUANTITATIVE &&
                <AvFieldGroup>
                    <AvField
                        name={"attr-" + data.attribute_id}
                        type={inputTypeToHtml5Type(input_validation_type, date_format_type)}
                        className="stepper-none"
                        validate={{
                            ...FormValidate.maxLength(ATTR_VALIDATE.TEXT_FILED.MAX_LENGTH),
                            ...FormValidate.withCondition(input_validation_type === INPUT_VALIDATION_TYPE.INT_TYPE, FormValidate.integerNumber())
                        }}
                        placeholder={i18n.t('page.shopee.product.pleaseInput')}
                        onBlur={e => onChange(e, e.currentTarget.value)}
                        value={stValue}
                    />

                    <AvField
                        type={"select"}
                        name={data.attribute_id + '-unit'}
                        value={stUnit}
                        onChange={onChangeUnit}
                    >
                        {attribute_unit.map(unit => (
                            <option value={unit}>{unit}</option>
                        ))}
                    </AvField>
                </AvFieldGroup>}
                {format_type === FORMAT_TYPE.NORMAL &&
                <AvField
                    type={inputTypeToHtml5Type(input_validation_type, date_format_type)}
                    name={"attr-" + data.attribute_id}
                    className="stepper-none"
                    placeholder={i18n.t('page.shopee.product.pleaseInput')}
                    onBlur={e => onChange(e, e.currentTarget.value)}
                    validate={{
                        ...FormValidate.maxLength(ATTR_VALIDATE.TEXT_FILED.MAX_LENGTH),
                        ...FormValidate.withCondition(input_validation_type === INPUT_VALIDATION_TYPE.INT_TYPE, FormValidate.integerNumber())
                    }}
                    value={stValue}
                />}
            </>

        )
    }

    /**
     * SELECT SINGLE
     * MAX LENGTH: 1
     * CREATABLE OPTIONS: TRUE
     * @return {JSX.Element}
     * @constructor
     */
    const ComboBox = () => {
        const {attribute_value_list} = data
        const options = attribute_value_list.map(attr => ({
            value: resolveAttrValue(attr.value_id, attr.value_unit),
            label: formatOptionLabel(attr.display_value_name, attr.value_unit),
        }))


        return (
                <GSSelect
                    options={options}
                    placeholder={i18n.t('page.shopee.product.pleaseSelect')}
                    noOptionsMessage={i18n.t("common.text.no.opt.message")}
                    onChange={value => onChange(null, value)}
                    value={stValue}
                    isSearchable
                >

                </GSSelect>
        )
    }

    /**
     * SELECT MULTIPLE
     * MAX LENGTH: 5
     * CREATABLE OPTIONS: FALSE
     * @return {JSX.Element}
     * @constructor
     */
    const MultipleSelect = () => {
        const {attribute_value_list} = data
        const options = attribute_value_list.map(attr => ({
            value: resolveAttrValue(attr.value_id, attr.value_unit),
            label: formatOptionLabel(attr.display_value_name, attr.value_unit),
        }))

        return (
            <GSSelect
                options={options}
                isMulti
                isSearchable
                placeholder={i18n.t('page.shopee.product.pleaseSelect')}
                noOptionsMessage={i18n.t("common.text.no.opt.message")}
                onChange={value => onChange(null, value)}
                value={stValue}
            />
        )
    }

    /**
     * SELECT MULTIPLE
     * MAX LENGTH: 5
     * CREATABLE OPTIONS: TRUE
     * @return {JSX.Element}
     * @constructor
     */
    const MultipleSelectComboBox = () => {
        const {attribute_value_list} = data
        const options = attribute_value_list.map(attr => ({
            value: resolveAttrValue(attr.value_id, attr.value_unit),
            label: formatOptionLabel(attr.display_value_name, attr.value_unit),
        }))

        return (
            <GSSelect
                options={options}
                isMulti
                isSearchable
                placeholder={i18n.t('page.shopee.product.pleaseSelect')}
                noOptionsMessage={i18n.t("common.text.no.opt.message")}
                onChange={value => onChange(null, value)}
                value={stValue}
            />
        )
    }

    const renderInput = () => {
        switch (props.data['input_type']) {
            case INPUT_TYPE.TEXT_FILED:
                return TextField()
            case INPUT_TYPE.DROP_DOWN:
            case INPUT_TYPE.BRAND:
                return DropDown()
            case INPUT_TYPE.COMBO_BOX:
                return ComboBox()
            case INPUT_TYPE.MULTIPLE_SELECT:
                return MultipleSelect()
            case INPUT_TYPE.MULTIPLE_SELECT_COMBO_BOX:
                return MultipleSelectComboBox()
        }
        return null
    }

    return (
        <div className="row mb-4">
            <div className="col-12 col-md-4 pl-0">
                <span className="gs-frm-input__label d-block" style={{
                    paddingTop: '.6rem'
                }}>
                    {data.display_attribute_name}
                    {data.is_mandatory &&
                    <span className="color-red">&nbsp;(*)</span>
                    }
                </span>
            </div>
            <div className="col-12 col-md-8" onClick={onTouched}>
                <div>
                    {renderInput()}
                </div>
                {( (props.showError || stTouched) && !stValid) &&
                <div>
                    <AlertInline type={AlertInlineType.ERROR}
                                 nonIcon
                                 text={i18n.t('common.validation.required')}
                                 textAlign="left"
                                 padding={false}
                                 style={{paddingTop: '.5rem'}}
                    />
                </div>}
            </div>
        </div>
    )
}

Attribute.propTypes = {
    data: PropTypes.object,
    onValidChange: PropTypes.func,
    showError: PropTypes.bool,
    onChange: PropTypes.func,
    onChangeUnit: PropTypes.func,
}


ShopeeEditProductAttributeSelector.propTypes = {
    categoryId: PropTypes.string,
    shopeeShopId: PropTypes.string,
    defaultValue: PropTypes.arrayOf(
        PropTypes.shape({
            attributeId: PropTypes.number,
            isMandatory: PropTypes.bool,
            originalAttributeName: PropTypes.string,
            values: PropTypes.arrayOf(PropTypes.shape({
                original_value_name: PropTypes.string,
                value_id: PropTypes.number,
                value_unit: PropTypes.string,
            })),
        })),
    defaultBrand: PropTypes.shape({
        brand_id: PropTypes.number,
        original_brand_name: PropTypes.string,
    }),
};

export default ShopeeEditProductAttributeSelector;
