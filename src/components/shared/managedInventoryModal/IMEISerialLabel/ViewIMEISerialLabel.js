import React, {useState} from 'react'
import styled from 'styled-components'
import {arrayOf, bool, string} from 'prop-types'
import i18next from 'i18next'
import {Modal, ModalBody, ModalHeader} from 'reactstrap'
import GSTrans from '../../GSTrans/GSTrans'

const IMEILabel = styled.span`
  color: ${ props => props.invalid ? '#DB1B1B' : '#556CE7' };
  font-style: italic;
  font-size: 9px;
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

const CodeLabel = styled.div`
  display: flex;
  background-color: #1E69D5;
  border-radius: 3px;
  color: #FFFFFF;
  margin-top: 13px;
  align-items: center;
  padding: 8px 5px;
  width: fit-content;
  font-size: 12px;
`

const ModelHeaderWrapper = styled.div`
  .modal-header {
    background-color: #F8F8F8;
    padding-top: 10px;

    .modal-title span {
      margin: 0;
      color: black;
      font-size: 18px;
      font-weight: 500;
      text-align: initial;
      margin-left: 15px;
      padding-bottom: 10px;
    }
  }
`

const ViewIMEISerialLabel = props => {
    const {
        className,
        hidden,
        invalid,
        itemModelCodes
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

    return (
        <>
            <Modal isOpen={ stModal } toggle={ () => handleToggleModal() } size="xl">
                <ModelHeaderWrapper>
                    <ModalHeader toggle={ () => handleToggleModal() }>
                        <span>
                            <GSTrans t="component.viewIMEISerialLabel.title"/>
                        </span>
                    </ModalHeader>
                </ModelHeaderWrapper>
                <ModalBody style={ {
                    maxHeight: document.documentElement.clientHeight - 130,
                    overflowY: 'auto'
                } }>
                    {
                        itemModelCodes.map(({ code }) =>
                            <CodeLabel>
                                { code }
                            </CodeLabel>
                        )
                    }
                </ModalBody>
            </Modal>
            <IMEILabel
                className={ className }
                invalid={ invalid }
                onClick={ () => handleToggleModal(true) }
            >{
                i18next.t('component.imeiSerialLabel.update', { quantity: itemModelCodes.length })
            }</IMEILabel>
        </>
    )
}

ViewIMEISerialLabel.defaultProps = {
    hidden: false,
    invalid: false,
    itemModelCodes: []
}

ViewIMEISerialLabel.propTypes = {
    className: string,
    invalid: bool,
    hidden: bool,
    itemModelCodes: arrayOf(string)
}

export default ViewIMEISerialLabel