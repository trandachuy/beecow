import React, {useEffect, useState} from 'react'
import styled from 'styled-components'
import {Trans} from 'react-i18next'
import {bool, func, number, string} from 'prop-types'
import './PriceAndVATEditor.sass'
import {Label} from 'reactstrap'
import {UikSelect} from '../../../../@uik'
import GSComponentTooltip, {
    GSComponentTooltipPlacement,
    GSComponentTooltipTrigger
} from '../../../../components/shared/GSComponentTooltip/GSComponentTooltip'
import GSTrans from '../../../../components/shared/GSTrans/GSTrans'

const TaxLabel = styled.span`
  color: #556CE7;
  font-style: italic;
  font-size: 11px;
  display: flex;
  align-items: center;
  cursor: pointer;
  margin-top: 15px;

  &:hover {
    text-decoration: underline;
  }

  &::before {
    content: '';
    display: inline-block;
    background-image: url(/assets/images/icon_tax.svg);
    width: 16px;
    height: 16px;
    margin-right: 9px;
  }
`

const PriceAndVATEditor = props => {
    const { taxId, disabled, lstTax, selectedTax } = props

    const [getTaxId, setTaxId] = useState(0)

    useEffect(() => {
        if (!taxId) {
            return
        }

        setTaxId(taxId)
    }, [taxId])

    const handleSelected = (tax) => {
        if (disabled) {
            return
        }

        setTaxId(tax.value)
        props.onSelected(props.itemModelId, tax)
    }

    return (
        <GSComponentTooltip
            placement={ GSComponentTooltipPlacement.BOTTOM }
            trigger={ GSComponentTooltipTrigger.CLICK }
            interactive
            theme={ 'light' }
            html={
                <div className="item-purchase-order-price-and-vat">
                    <div>
                        <Label for={ 'tax_value' } className="gs-frm-control__title">
                            <Trans i18nKey="page.setting.VAT.table.tax"/>
                        </Label>

                        <UikSelect
                            className={ disabled ? 'disabled' : '' }
                            defaultValue={ getTaxId }
                            options={ lstTax }
                            onChange={ handleSelected }
                        />
                    </div>
                </div>
            }>
            {
                selectedTax || <TaxLabel>
                    <GSTrans t="page.purchaseOrderFormEditor.select.tax"/>
                </TaxLabel>
            }
        </GSComponentTooltip>
    )
}

PriceAndVATEditor.defaultProps = {
    disabled: false,
    onSelected: () => {
    }
}

PriceAndVATEditor.propTypes = {
    taxId: number,
    itemModelId: number,
    disabled: bool,
    selectedTax: string,
    onSelected: func
}

export default PriceAndVATEditor
