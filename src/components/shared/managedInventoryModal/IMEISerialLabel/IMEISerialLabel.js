import React, {useState} from 'react'
import styled from 'styled-components'
import {arrayOf, bool, func, number, string} from 'prop-types'
import i18next from 'i18next'
import IMEISerialModal from '../IMEISerialModal/IMEISerialModal'

const IMEILabel = styled.span`
  color: ${ props => props.invalid ? '#DB1B1B' : '#556CE7' };
  font-style: italic;
  font-size: 11px;
  display: flex;
  align-items: center;
  cursor: pointer;
  margin-top: 15px;
  white-space: nowrap;

  &:hover {
    text-decoration: underline;
  }

  &::before {
    content: '';
    display: inline-block;
    background-image: url(/assets/images/purchase_order/icon_imei.png);
    width: 16px;
    height: 16px;
    margin-right: 9px;
  }
`

const IMEISerialLabel = props => {
    const {
        className,
        hidden,
        invalid,
        itemModelCodes,
        onCancel,
        onSave,
        currentScreen,
        maxQuantity,
        ...others
    } = props

    if (hidden) {
        return null
    }

    const [stModal, setStModal] = useState(false)

    const handleToggleModal = (toggle) => {
        if (toggle == undefined) {
            setStModal(modal => !modal)
        } else {
            setStModal(toggle)
        }
    }

    const handleCancel = () => {
        handleToggleModal(false)
        onCancel()
    }

    const handleSave = (data) => {
        handleToggleModal(false)
        onSave(data)
    }

    return (
        <>
            <IMEISerialModal
                toggle={ stModal }
                showBranchList={ false }
                itemModelCodes={ [...itemModelCodes] }
                onToggle={ handleToggleModal }
                onCancel={ handleCancel }
                onSave={ handleSave }
                currentScreen={ currentScreen }
                maxQuantity={ maxQuantity }
                { ...others }
            />
            <IMEILabel
                className={ className }
                invalid={ invalid }
                onClick={ () => handleToggleModal(true) }
            >{
                itemModelCodes.length
                    ? (
                        !_.isNaN(parseInt(maxQuantity))
                            ? i18next.t('component.imeiSerialLabel.update.max', {
                                quantity: itemModelCodes.length,
                                maxQuantity
                            })
                            : i18next.t('component.imeiSerialLabel.update', { quantity: itemModelCodes.length })
                    )
                    : (
                        currentScreen === IMEISerialModal.SHOW_AT_SCREEN.TRANSFER_TO_BRANCH
                        || currentScreen === IMEISerialModal.SHOW_AT_SCREEN.TRANSFER_TO_PARTNER
                    )
                    ? i18next.t('component.imeiSerialLabel.select')
                    : i18next.t('component.imeiSerialLabel.add')
            }</IMEILabel>
        </>
    )
}

IMEISerialLabel.defaultProps = {
    hidden: false,
    invalid: false,
    itemModelCodes: [],
    onCancel: function () {
    },
    onSave: function () {
    }
}

IMEISerialLabel.propTypes = {
    className: string,
    hidden: bool,
    invalid: bool,
    itemModelCodes: arrayOf(string),
    maxQuantity: number,
    onCancel: func,
    onSave: func
}

export default IMEISerialLabel