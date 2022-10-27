import React, {useEffect, useRef, useState, useImperativeHandle} from 'react'
import PropTypes from 'prop-types'
import {Trans} from "react-i18next"
import './TikiEditProductVariantsTable_1.sass'
import {AvField, AvForm} from 'availity-reactstrap-validation'
import i18next from "i18next"
import {CurrencySymbol} from "../../../../../components/shared/form/CryStrapInput/CryStrapInput"
import Constants from "../../../../../config/Constant"
import accounting from 'accounting-js'
import AlertInline from "../../../../../components/shared/AlertInline/AlertInline"
import {FormValidate} from "../../../../../config/form-validate";

const UNIT_FORMAT = {
    symbol: CurrencySymbol.VND,
    thousand: ',',
    precision: 0,
    format: "%v%s"
}
const THOUSAND_FORMAT = {
    symbol: CurrencySymbol.VND,
    thousand: ',',
    precision: 0,
    format: "%v"
}

const TikiEditProductVariantsTable_1 = React.forwardRef((props, ref) => {
    const [stVariations, setStVariations] = useState([])
    const [stTiers, setStTiers] = useState([])
    const [stHasErrorD3p0s1t, setStHasErrorD3p0s1t] = useState(false)
    const [stHasErrorMarketPrice, setStHasErrorMarketPrice] = useState(false)

    const refFrom = useRef(null)

    useEffect(() => {
        convertDataModel()
    }, [])

    useImperativeHandle(ref, () => {
        return {
            refFrom: refFrom,
            isInvalidForm: isInvalidForm,
            getTiers: getTiers,
            getVariations: getVariations,
        }
    })

    const convertDataModel = () => {
        let variations = []
        let tier_variations = []
        let models = props.models
        let tier_variations_option1 = []
        let tier_variations_option2 = []
        //flag to enable when have just one variation with label is "d3p0s1t" and option is not 100P3rc3nt
        let isEmptyVariationWhenHavePartialD3p0s1t = false;

        // tier
        let tiers_name = models[0].label.split('|')

        //dont support '[d3p0s1t]' variation for tiki
        let d3p0s1tIndexes = []
        tiers_name = tiers_name.filter((name, index) => {
            if (name === '[d3p0s1t]') {
                d3p0s1tIndexes.push(index)

                return false
            }

            return true
        })

        models.forEach(model => {
            let options_name = model.orgName.split('|')
            let option1 = options_name[0]
            let option2 = options_name[1]

            if (tier_variations_option1.findIndex(s => s === option1) === -1) {
                if (d3p0s1tIndexes.indexOf(0) === -1) {
                    // if dont be deposit
                    tier_variations_option1.push(option1)
                } else if (option1 !== '[100P3rc3nt]') {
                    isEmptyVariationWhenHavePartialD3p0s1t = true

                    //if is deposit and dont be 100%, remove variation row
                    return;
                }
                //if is deposit and is 100%, just remove variation column
            }

            if (tier_variations_option2.findIndex(s => s === option2) === -1) {
                if (d3p0s1tIndexes.indexOf(1) === -1) {
                    // if dont be deposit
                    tier_variations_option2.push(option2)
                } else if (option2 !== '[100P3rc3nt]') {
                    isEmptyVariationWhenHavePartialD3p0s1t = true

                    //if is deposit and dont be 100%, remove variation row
                    return;
                }
                //if is deposit and is 100%, just remove variation column
            }

            //--------------------------------//
            // variation
            //--------------------------------//
            let index = []
            index.push(tier_variations_option1.findIndex(s => s === option1))

            if (tiers_name.length > 1) {
                index.push(tier_variations_option2.findIndex(s => s === option2))
            }

            variations.push({
                id: model.id,
                tkItemId: model.tkItemId,
                tkVariantId: model.tkVariantId,
                newPrice: model.newPrice,
                marketPrice: model.orgPrice,
                totalItem: model.totalItem,
                name: model.name,
                sku: model.sku ? model.sku : null,
                tierIndex: index.join(','),
                image: model.image,
            })
        })

        if (isEmptyVariationWhenHavePartialD3p0s1t && !variations.length) {
            //throw error when user wanna add new a model with one partial deposit variation
            setStHasErrorD3p0s1t(true)
        }

        //--------------------------------//
        // tier variation
        //--------------------------------//
        tier_variations.push({
            name: tiers_name[0],
            options: tier_variations_option1
        })

        if (tiers_name.length > 1) {
            tier_variations.push({
                name: tiers_name[1],
                options: tier_variations_option2
            })
        }

        setStVariations(variations)
        setStTiers(tier_variations)
    }

    const checkPriceVariant = () => {
        let hasErrorMarketPrice = false

        stVariations.forEach(variation => {
            const price = parseInt(variation.newPrice)
            const marketPrice = parseInt(variation.marketPrice)

            if (price && marketPrice) {
                //variation price must be less than market price and greater than 10% of market price
                if (price > marketPrice || price <= (marketPrice / 10)) {
                    hasErrorMarketPrice = true

                    return
                }
            }
        })

        setStHasErrorMarketPrice(hasErrorMarketPrice)
        return hasErrorMarketPrice
    }

    const isInvalidForm = () => {
        if (refFrom.current.hasError()) {
            return true
        }
        if (stHasErrorD3p0s1t) {
            return true
        }

        return checkPriceVariant()
    }

    const onFieldChange = (row, value, name) => {
        let variations = stVariations

        if (name === "sku") {
            variations[row].sku = value
        } else if (name === "newPrice") {
            const intData = (value + '').split(',').join('')

            variations[row].newPrice = intData ? parseInt(intData) : 0
        } else if (name === "marketPrice") {
            const intData = (value + '').split(',').join('')

            variations[row].marketPrice = intData ? parseInt(intData) : 0
        } else if (name === "stock") {
            const intData = (value + '').split(',').join('')

            variations[row].totalItem = intData ? parseInt(intData) : 0
            variations[row].soldItem = 0
        }

        setStVariations(variations)
    }

    const onModelValueChange = (tier_position, optionPosition, value) => {
        // update tier position
        let tiers = stTiers
        let tier = tiers[tier_position]

        tier.options[optionPosition] = value
        tiers[tier_position] = tier

        setStTiers(tiers)
    }

    const onModelLabelChange = (colIndex, value) => {
        let tiers = stTiers

        tiers[colIndex].name = value
        setStTiers(tiers)
    }

    const isTwoVariants = () => {
        return stTiers.length > 1
    }

    const getVariations = () => {
        return stVariations
    }

    const getTiers = () => {
        return stTiers
    }

    const priceValidation = (value) => {
        const intData = (value + '').split(',').join('')

        if (isNaN(intData)) {
            const message = i18next.t("common.validation.number.format")

            return message
        }

        if (parseInt(intData) < Constants.N10_000) {
            const message = i18next.t("common.validation.number.min.value", {
                x: accounting.formatMoney(Constants.N10_000, UNIT_FORMAT)
            })

            return message
        }

        if (parseInt(intData) > Constants.N100_000_000) {
            const message = i18next.t("common.validation.number.max.value", {
                x: accounting.formatMoney(Constants.N100_000_000, UNIT_FORMAT)
            })

            return message
        }

        return true
    }

    const stockValidation = (value) => {
        const intData = (value + '').split(',').join('')

        if (isNaN(intData)) {
            const message = i18next.t("common.validation.number.format")

            return message
        }

        if (parseInt(intData) <= 0) {
            const message = i18next.t("common.validation.number.min.value", {
                x: accounting.formatMoney(1, THOUSAND_FORMAT)
            })

            return message
        }

        if (parseInt(intData) > Constants.N1_000) {
            const message = i18next.t("common.validation.number.max.value", {
                x: accounting.formatMoney(Constants.N1_000, THOUSAND_FORMAT)
            })

            return message
        }

        return true
    }

    const duplicateValidation = (value, ctx) => {
        if (isTwoVariants() && ctx["label0"] === ctx["label1"]) {
            return i18next.t('page.tiki.product.edit.variant_duplicate.title')
        }

        return true
    }

    const skuValidation = (value, ctx, id) => {
        if (stVariations.find(variation => (variation.id !== id && variation.sku === value))) {
            return i18next.t('page.tiki.product.edit.sku_duplicate.title')
        }

        if (!/^[a-zA-Z0-9]+$/.test(value)) {
            return i18next.t('page.tiki.product.edit.sku_format.title')
        }

        return true
    }

    const renderModels = () => {
        return stVariations.map((variation, index) => {
            let tiers_index = variation.tierIndex.split(',')

            let option1 = stTiers[0].options[tiers_index[0]]
            let option2 = tiers_index.length === 2 ? stTiers[1].options[tiers_index[1]] : ''

            return (
                <tr key={index}>
                    <td className="td-word__break">
                        {option1} {option2 ? ' - ' + option2 : ''}
                    </td>
                    <td className="td-top">
                        <AvField
                            name={"model1" + index}
                            value={stTiers[0] ? option1 : ''}
                            onBlur={(e, value) => onModelValueChange(0, tiers_index[0], value, index)}
                            validate={{
                                required: {value: true, errorMessage: i18next.t("common.validation.required")},
                                maxLength: {
                                    value: 20,
                                    errorMessage: i18next.t("common.validation.char.max.length", {x: 20})
                                }
                            }}
                        />
                    </td>
                    {isTwoVariants() &&
                    <td className="td-top">
                        <AvField
                            name={"model2" + index}
                            value={stTiers[1] ? option2 : ''}
                            onBlur={(e, value) => onModelValueChange(1, tiers_index[1], value, index)}
                            validate={{
                                required: {
                                    value: isTwoVariants(),
                                    errorMessage: i18next.t("common.validation.required")
                                },
                                maxLength: {
                                    value: 20,
                                    errorMessage: i18next.t("common.validation.char.max.length", {x: 20})
                                }
                            }}
                        />
                    </td>}
                    <td className="td-top">
                        <AvField
                            onChange={(e, value) => onFieldChange(index, value, "stock")}
                            name={'productStock' + (index)}
                            value={accounting.formatMoney(variation.totalItem, THOUSAND_FORMAT)}
                            validate={{
                                stockValidation: stockValidation,
                                maxLength: {
                                    value: 12,
                                    errorMessage: i18next.t("common.validation.char.max.length", {x: 12})
                                },
                                required: {value: true, errorMessage: i18next.t("common.validation.required")}
                            }}
                        />
                    </td>
                    <td className="price-product td-top">
                        <span className="money-unit">{CurrencySymbol.VND}</span>
                        <AvField
                            onChange={(e, value) => onFieldChange(index, value, "marketPrice")}
                            onBlur={checkPriceVariant}
                            value={accounting.formatMoney(variation.marketPrice, THOUSAND_FORMAT)}
                            name={'marketPrice' + (index)}
                            validate={{
                                priceValidation: priceValidation,
                                maxLength: {
                                    value: 12,
                                    errorMessage: i18next.t("common.validation.char.max.length", {x: 12})
                                },
                                required: {value: true, errorMessage: i18next.t("common.validation.required")}
                            }}
                        />
                    </td>
                    <td className="price-product td-top">
                        <span className="money-unit">{CurrencySymbol.VND}</span>
                        <AvField
                            onChange={(e, value) => onFieldChange(index, value, "newPrice")}
                            onBlur={checkPriceVariant}
                            value={accounting.formatMoney(variation.newPrice, THOUSAND_FORMAT)}
                            name={'productPrice' + (index)}
                            validate={{
                                priceValidation: priceValidation,
                                maxLength: {
                                    value: 12,
                                    errorMessage: i18next.t("common.validation.char.max.length", {x: 12})
                                },
                                required: {value: true, errorMessage: i18next.t("common.validation.required")}
                            }}
                        />
                    </td>
                    <td className="td-top">
                        <AvField
                            onBlur={(e, value) => onFieldChange(index, value, "sku")}
                            value={variation.sku}
                            name={'variationSku' + (index)}
                            validate={{
                                ...FormValidate.required(),
                                skuValidation: (value, ctx) => skuValidation(value, ctx, variation.id),
                                maxLength: {
                                    value: 25,
                                    errorMessage: i18next.t("common.validation.char.max.length", {x: 25})
                                },
                            }}
                        />
                    </td>
                </tr>
            )
        })
    }

    return (
        <AvForm ref={refFrom}>
            {stVariations.length > 0 &&
            <table className="tiki-edit-product-variants-table">
                <thead>
                <tr className="gsa__uppercase gsa__label-08r gsa__color--gray gsa__border-bt--gray gsa__padding-bt--05em">
                    <th>
                        <Trans i18nKey="page.tiki.product.detail.variantsTable.variant"/>
                    </th>
                    <th>
                        <AvField name={"label" + 0} value={stTiers[0] ? stTiers[0].name : ''}
                                 onBlur={(e, value) => onModelLabelChange(0, value)}
                                 validate={{
                                     required: {value: true, errorMessage: i18next.t("common.validation.required")},
                                     duplicateValidation: duplicateValidation,
                                     maxLength: {
                                         value: 14,
                                         errorMessage: i18next.t("common.validation.char.max.length", {x: 14})
                                     }
                                 }}/>
                    </th>
                    {isTwoVariants() &&
                    <th>
                        <AvField name={"label" + 1} value={stTiers[1] ? stTiers[1].name : ''}
                                 onBlur={(e, value) => onModelLabelChange(1, value)}
                                 validate={{
                                     duplicateValidation: duplicateValidation,
                                     required: {value: true, errorMessage: i18next.t("common.validation.required")},
                                     maxLength: {
                                         value: 14,
                                         errorMessage: i18next.t("common.validation.char.max.length", {x: 14})
                                     }
                                 }}/>
                    </th>}
                    <th>
                        <Trans i18nKey="page.tiki.product.detail.variantsTable.stock"/>
                    </th>

                    <th>
                        <Trans i18nKey="component.product.addNew.pricingAndInventory.price"/>
                    </th>
                    <th>
                        <Trans i18nKey="component.product.addNew.pricingAndInventory.discountPrice"/>
                    </th>
                    <th>
                        SKU
                    </th>
                </tr>
                </thead>
                <tbody>
                {renderModels()}
                </tbody>
            </table>}

            {stHasErrorD3p0s1t &&
            <AlertInline
                text={i18next.t('page.tiki.product.edit.error.d3p0s1t')}
                type="error"
                nonIcon
            />}
            {stHasErrorMarketPrice &&
            <AlertInline
                text={i18next.t('page.tiki.product.edit.error.marketPrice')}
                type="error"
                nonIcon
            />}
        </AvForm>
    )
})

TikiEditProductVariantsTable_1.propTypes = {
    models: PropTypes.array
}

export default TikiEditProductVariantsTable_1
